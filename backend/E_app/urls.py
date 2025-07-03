from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import * 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()

# Core Routers
router.register(r'user', UserViewSet, basename='user')
router.register(r'customers', CustomerProfileViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet, basename='products')
router.register(r'banner', BannerViewSet, basename='banner')
router.register(r'subscribe', EmailSubscriberViewSet, basename='subscribe')

# Cart & Wishlist
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
router.register(r'wishlists', WishlistViewSet, basename='wishlist')

# Order & Payment
router.register(r'order', OrderViewSet)
router.register(r'shipping', ShippingViewSet)
router.register(r'payment', PaymentViewSet)
router.register(r'coupon', CouponViewSet)
router.register(r'refund', RefundViewSet)

# Reviews & Notifications
router.register(r'review', ReviewViewSet)
router.register(r'notification', NotificationViewSet)

# Blog & Contact
router.register(r'blog', BlogViewSet)
router.register(r'contact', ContactViewSet)

# Miscellaneous
router.register(r'faq', FAQViewSet)
router.register(r'analytics', AnalyticsViewSet)
router.register(r'configuration', ConfigurationViewSet)
router.register(r'tax', TaxViewSet)
router.register(r'subscription', SubscriptionViewSet)

# ✅ Main URL patterns
urlpatterns = [
    path('api/', include(router.urls)),

    # Authentication
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # SSLCOMMERZ Payment
   
]
