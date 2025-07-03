from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.models import AbstractUser
from django.conf import settings





class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email
  
    


#class VendorProfile(models.Model):
#    user = models.OneToOneField(User, on_delete=models.CASCADE)
#    shop_name = models.CharField(max_length=100)
#    address = models.CharField(max_length=255, blank=True)
#    phone = models.CharField(max_length=20, blank=True)

#    def __str__(self):
#        return f"{self.shop_name} ({self.user.email})"   

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    image = models.ImageField(upload_to='images/', blank=True, null=True)

    def __str__(self):
        return self.user.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories' )
    image = models.ImageField(upload_to='category/', null=True, blank=True)

    def __str__(self):
        return self.name 




class Product(models.Model):
  #  vendor = models.ForeignKey('VendorProfile', on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description  = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=100, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField()
    image = models.ImageField(upload_to='products')
    created_at = models.DateTimeField(auto_now_add= True)
    update_at = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0.0)  
    sales = models.IntegerField(default=0)

    
    #@property
    #def discount_percent(self):
    #    if self.discount_price and self.price:
    #        return round(100 - (self.discount_price / self.price * 100))
    #    return 0
    
    @property
    def discount_percent(self):
        if self.discount_price and self.price and self.discount_price < self.price:
            return round(100 - (self.discount_price / self.price * 100))
        return 0
    
    def __str__(self):
        return self.name

# ================= Order =================

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    products = models.ManyToManyField(Product, through='OrderItem')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    def __str__(self):
            return f"Order {self.id} by {self.user.email} - Total: {self.total_price}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)


# ================= Cart =================

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    # No shipping_charge here because global

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

# ================= Wishlist =================

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}'s Wishlist"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s Wishlist"



class Shipping(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)


class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add= True)    


class Coupon(models.Model):
    code = models.CharField(max_length=100, unique=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    valid_form = models.DateTimeField()
    valid_to = models.DateField()

# ================= Review =================

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
   


class Notification(models.Model):
 #   user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add= True)


class Blog(models.Model):
    title  =models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
#    auther = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add= True)
    update_at = models.DateTimeField(auto_now=True)


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add= True)
    

class FAQ(models.Model):
    question = models.TextField()
    answer = models.TextField()


class Analytics(models.Model):
    sales = models.DecimalField(max_digits=10, decimal_places=2)   
    traffic = models.PositiveBigIntegerField()
    popular_products = models.ManyToManyField(Product, related_name='analytics')
    created_at = models.DateTimeField(auto_now_add= True)
    

class Configuration(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.key}: {self.value}"


class Tax(models.Model):
    name = models.CharField( max_length=100)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    country = models.CharField( max_length=100)
    state = models.CharField(max_length=100, null=True, blank=True) 


class Subscription(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateField(auto_now_add=True)


class Refund(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds')
    reason = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2) 
    status = models.CharField( max_length=100)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at =models.DateTimeField(null=True, blank=True) 


class BannerFeature(models.Model):
    ICON_CHOICES = [
        ('GrSecure', 'GrSecure'),
        ('IoFastFood', 'IoFastFood'),
        ('GiFoodTruck', 'GiFoodTruck'),
    ]
    BGCOLOR_CHOICES = [
        ('violet', 'violet'),
        ('orange', 'orange'),
        ('green', 'green'),
        ('yellow', 'yellow'),
    ]

    icon = models.CharField(max_length=20, choices=ICON_CHOICES)
    text = models.CharField(max_length=100)
    bg_color = models.CharField(max_length=20, choices=BGCOLOR_CHOICES)
    banner = models.ForeignKey('Banner', on_delete=models.CASCADE, related_name='features')

    def __str__(self):
        return self.text


class Banner(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    active = models.BooleanField(default=False)
    image = models.ImageField(upload_to='banner_images/')

    def __str__(self):
        return self.title     




    




