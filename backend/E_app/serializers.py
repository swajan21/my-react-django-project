from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator


User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    address = serializers.CharField(required=False, allow_blank=True, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        phone = attrs.get('phone')

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        if phone and CustomerProfile.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({"phone": "This phone number is already registered."})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        name = validated_data.get('name')
        address = validated_data.get('address', '')
        phone = validated_data.get('phone', '')

        user = User.objects.create_user(email=email, name=name, password=password)
        CustomerProfile.objects.create(user=user, address=address, phone=phone)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']




class CustomerProfileSerializer(serializers.ModelSerializer):
    # Flat fields for update
    name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = CustomerProfile
        fields = ['name', 'email', 'phone', 'address', 'image']

    def to_representation(self, instance):
        """Customize output to include user data"""
        rep = super().to_representation(instance)
        rep["name"] = instance.user.name
        rep["email"] = instance.user.email
        return rep

    def update(self, instance, validated_data):
        user = instance.user

        # Access name and email directly from the initial_data
        user.name = self.initial_data.get("name", user.name)
        user.email = self.initial_data.get("email", user.email)
        user.save()

        instance.phone = validated_data.get("phone", instance.phone)
        instance.address = validated_data.get("address", instance.address)

        if "image" in validated_data:
            instance.image = validated_data["image"]

        instance.save()
        return instance
         

class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'      


class CategorySerializer(serializers.ModelSerializer):
    products = ProductSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'              


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only = True)
    category = serializers.StringRelatedField()
    reviews = serializers.StringRelatedField(many = True, read_only = True)
    discount_percent = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = '__all__'
      
    def get_discount_percent(self, obj):
        return getattr(obj, 'discount_percent', obj.discount_percent if hasattr(obj, 'discount_percent') else 0)
        

class DiscountedProductSliderSerializer(serializers.ModelSerializer):
    discount_percent = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'discount_price', 'discount_percent', 'image']        


class OrderSerializer(serializers.ModelSerializer):
  #  customer = UserSerializer(read_only = True)
    products = ProductSerializer(read_only = True)

    class Meta:
        model = Order
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
      
    class Meta:
        model = OrderItem
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'final_price']

    def get_final_price(self, obj):
        product = obj.product
        price = product.discount_price if product.discount_price else product.price
        return price * obj.quantity

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'


class ShippingSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Shipping
        fields = '__all__' 


# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'method', 'amount', 'transaction_id', 'created_at']        


class CouponSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Coupon
        fields = '__all__' 


class ReviewSerializer(serializers.ModelSerializer):
  #  customer = UserSerializer(read_only = True)
    
    class Meta:
        model = Review
        fields = '__all__' 


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'added_at']          


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'created_at', 'items']
        read_only_fields = ['user']


      


class NotificationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Notification
        fields = '__all__' 


class BlogSerializer(serializers.ModelSerializer):
  #  auther = UserSerializer(read_only = True)
    
    class Meta:
        model = Blog
        fields = '__all__' 


class ContactSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Contact
        fields = '__all__' 


class FAQSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = FAQ
        fields = '__all__' 


class AnalyticsSerializer(serializers.ModelSerializer):
    popular_products = ProductSerializer(many=True, read_only = True)
    
    class Meta:
        model = Analytics
        fields = '__all__' 

class ConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuration
        fields = '__all__'


class TaxSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Tax
        fields = '__all__'     


class SubscriptionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Subscription
        fields = '__all__'      


class RefundSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only = True)
    
    class Meta:
        model = Refund
        fields = '__all__'   



class BannerFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = BannerFeature
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    features = BannerFeatureSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = '__all__'

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None        



 