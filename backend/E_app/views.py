
from rest_framework import viewsets, status, filters
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from django.db.models import F, FloatField , ExpressionWrapper, DecimalField
from django.db.models import Q
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import BasePermission, IsAuthenticated
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
from rest_framework.decorators import api_view
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import uuid





class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get", "put"], url_path="profile")
    def profile(self, request):
        user = request.user
        try:
            profile = user.customerprofile  # or user.vendorprofile if vendor
        except:
            return Response({"detail": "Profile not found"}, status=404)

        if request.method == "GET":
            serializer = CustomerProfileSerializer(profile)
            return Response(serializer.data)
        
        if request.method == "PUT":
            serializer = CustomerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"detail": "User with this email or phone already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )



class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]   

    def get_queryset(self):
        # Only allow users to see their own profile
        user = self.request.user
        return CustomerProfile.objects.filter(user=user)

    def perform_update(self, serializer):
        # Ensure user is assigned correctly
        serializer.save(user=self.request.user)   


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer 
    

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        category = self.get_object()
        products = category.products.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data) 

     


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description'] 

    


 #   @action(detail=False, methods=['get'])
 #   def best(self, request):
 #       # Return top 6 products sorted by rating (you can change this logic)
 #       top_products = Product.objects.order_by('-rating')[:10]
 #       serializer = self.get_serializer(top_products, many=True)
 #       return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def best(self, request):
         products = Product.objects.annotate(
             score=ExpressionWrapper(
                 F('rating') * F('sales'),  # or customize the formula
                 output_field=FloatField()
             )
         ).filter(rating__gt=0, sales__gt=0).order_by('-score')[:16]

         serializer = self.get_serializer(products, many=True)
         return Response(serializer.data)
    

    @action(detail=False, methods=['get'])
    def top_discounted(self, request):
       all_products = Product.objects.all()
    
        # Filter products using if-condition
       discounted_products = []
       for product in all_products:
        if product.discount_price and product.discount_price < product.price:
            discounted_products.append(product)
    
        # Sort using the property 'discount_percent'
       top_discounted = sorted(discounted_products, key=lambda p: p.discount_percent, reverse=True)[:10]
    
       serializer = self.get_serializer(top_discounted, many=True)
       return Response(serializer.data) 
    

 
    
 #   @action(detail=False, methods=['get'])
 #   def top_discounted(self, request):
 #       products = sorted(Product.objects.filter(), key=lambda p: p.discount_percent, reverse=True)[:10]
 #       serializer = self.get_serializer(products, many=True)
 #       return Response(serializer.data)
    

    

    def perform_update(self, serializer):
        old_product = self.get_object()
        old_discount_price = old_product.discount_price
        product = serializer.save()
        # If product was not discounted before but is now discounted
        if old_discount_price != product.discount_price and product.discount_price < product.price:
            send_discount_notification(product)
    
     

class EmailSubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        if Subscription.objects.filter(email=email).exists():
            return Response({'message': 'Already subscribed'}, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data={'email': email})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  # ← VERY HELPFUL
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

    
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all() 
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only orders of logged-in user
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @transaction.atomic
    @action(detail=False, methods=['post'])
    def place_order(self, request):
        user = request.user
        cart = get_object_or_404(Cart, user=user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get('shipping_address')
        if not shipping_address:
            return Response({"detail": "Shipping address required"}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0
        for item in cart_items:
            price = item.product.discount_price if item.product.discount_price else item.product.price
            total_price += price * item.quantity

        order = Order.objects.create(
            user=user,
            total_price=total_price,
            shipping_address=shipping_address,
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity
            )

        # Clear the cart
        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = CartItem.objects.filter(cart=cart)
        item_serializer = CartItemSerializer(items, many=True)

        # Calculate total price with discounted prices
        total_price = 0
        for item in items:
            product = item.product
            price = product.discount_price if product.discount_price else product.price
            total_price += price * item.quantity

        # Get shipping charge from configuration
        shipping_config = Configuration.objects.filter(key='shipping_charge').first()
        shipping_charge = shipping_config.value if shipping_config else Decimal('5.00')


        total_price = Decimal(total_price)

        total_price_with_shipping = total_price + shipping_charge

        return Response({
            "items": item_serializer.data,
            "total_price": total_price,
            "shipping_charge": shipping_charge,
            "total_price_with_shipping": total_price_with_shipping,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        if not product_id:
            return Response({"detail": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        cart_item.quantity = quantity
        cart_item.save()

        return Response({"detail": "Product added to cart"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def remove(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"detail": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()
        if cart_item:
            cart_item.delete()
            return Response({"detail": "Product removed from cart"}, status=status.HTTP_200_OK)
        return Response({"detail": "Product not found in cart"}, status=status.HTTP_404_NOT_FOUND)



class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return CartItems only for the logged-in user's cart
        cart = Cart.objects.filter(user=self.request.user).first()
        if cart:
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()


class ShippingViewSet(viewsets.ModelViewSet):
    queryset = Shipping.objects.all()
    serializer_class = ShippingSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
       product_id = request.data.get('product_id')
       wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

       if WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).exists():
           return Response({"detail": "Product already in wishlist."}, status=400)

       WishlistItem.objects.create(wishlist=wishlist, product_id=product_id)
       return Response({"detail": "Product added to wishlist."})
    

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
       product_id = request.data.get('product_id')
       wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

       item = WishlistItem.objects.filter(wishlist=wishlist, product_id=product_id).first()
       if item:
           item.delete()
           return Response({"detail": "Product removed from wishlist."})
       return Response({"detail": "Product not found in wishlist."}, status=404)



class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer


class AnalyticsViewSet(viewsets.ModelViewSet):
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer


class ConfigurationViewSet(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer


class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer


class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer

    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        banner = self.queryset.filter(active=True).first()
        if banner:
            serializer = self.get_serializer(banner, context={'request': request})
            return Response(serializer.data)
        return Response({})    
    


