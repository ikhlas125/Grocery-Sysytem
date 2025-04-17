create database cartify;
use cartify;

create table users (
    user_id varchar(6) primary key,
    username varchar(50) not null,
    password varchar(50) not null,
    email varchar(100) not null,
    user_type varchar(10) not null
);

create table customers (
    customer_id varchar(6) primary key,
    user_id varchar(6) unique,
    full_name varchar(100) not null,
    address varchar(255) not null,
    phone varchar(20) not null,
    foreign key (user_id) references users(user_id)
);

create table vendors (
    vendor_id varchar(6) primary key,
    user_id varchar(6) unique,
    vendor_name varchar(100) not null,
    address varchar(255) not null,
    phone varchar(20) not null,
    foreign key (user_id) references users(user_id)
);

create table categories (
    category_id varchar(6) primary key,
    category_name varchar(50) not null
);

create table products (
    product_id varchar(6) primary key,
    vendor_id varchar(6) not null,
    product_name varchar(255) not null,
    category_id varchar(6) not null,
    price decimal(10,2) not null,
    description varchar(500),
    foreign key (vendor_id) references vendors(vendor_id),
    foreign key (category_id) references categories(category_id)
);
alter table products add image_url varchar(100)

create table shopping_carts (
    cart_id varchar(6) ,
    customer_id varchar(6) not null,
    product_id varchar(6) not null,
    quantity int not null,
    foreign key (customer_id) references customers(customer_id),
    foreign key (product_id) references products(product_id)
);

create table orders (
    order_id varchar(6) primary key,
    customer_id varchar(6) not null,
    order_date datetime default getdate(),
    total_amount decimal(10,2) not null,
    payment_method varchar(50) not null,
    order_status varchar(20) default 'pending',
    foreign key (customer_id) references customers(customer_id)
);

create table order_details (
    order_detail_id varchar(6) primary key,
    order_id varchar(6) not null,
    product_id varchar(6) not null,
    quantity int not null,
    unit_price decimal(10,2) not null,
    foreign key (order_id) references orders(order_id),
    foreign key (product_id) references products(product_id)
);

-- Users
INSERT INTO users VALUES 
('U001', 'john_doe', 'pass123', 'john@email.com', 'customer'),
('U002', 'jane_smith', 'pass456', 'jane@email.com', 'customer'),
('U003', 'tech_store', 'vendorpw', 'tech@store.com', 'vendor');

-- Customers
INSERT INTO customers VALUES 
('C001', 'U001', 'John Doe', '123 Main St', '555-0101'),
('C002', 'U002', 'Jane Smith', '456 Elm St', '555-0202');

-- Vendors
INSERT INTO vendors VALUES 
('V001', 'U003', 'Tech Store', '789 Oak St', '555-0303');

-- Categories
INSERT INTO categories VALUES 
('CAT005', 'Perfume')
('CAT001', 'Electronics'),
('CAT002', 'Clothing'),
('CAT003', 'Books');

-- Insert the book product you specified
INSERT INTO products (product_id, vendor_id, product_name, category_id, price, description, image_url)
VALUES 
('P005', 'V001', 'A Song of Ice and Fire Series', 'CAT003', 35.65, 'An immersive entertainment experience unlike any other', '/images/book.jpg');

-- Products
INSERT INTO products VALUES 
('P005','V001','A Song of Ice and Fire Series','CAT003',35.65,'An immersive entertainment experience unlike any other','/images/book.jpg'),
('P004','V002','Coffee Maker','CAT001',359.00,'Simplify Your Routine - Tired of complicated coffee rituals? ','/images/coffee.jpg'),
('P001', 'V001', 'Wireless Headphones', 'CAT001', 99.99, 'Noise-cancelling Bluetooth headphones'),
('P002', 'V001', 'Smart Watch', 'CAT001', 199.99, 'Fitness tracking smartwatch'),
('P003', 'V001', 'Cotton T-Shirt', 'CAT002', 19.99, 'Plain white cotton t-shirt');

-- Shopping Carts
INSERT INTO shopping_carts VALUES 
('SC001', 'C001', 'P001', 1),
('SC002', 'C001', 'P002', 2),
('SC003', 'C002', 'P003', 3);

-- Orders
INSERT INTO orders (order_id, customer_id, total_amount, payment_method) VALUES 
('ORD001', 'C001', 299.97, 'Credit Card'),
('ORD002', 'C002', 59.97, 'PayPal');

-- Order Details
INSERT INTO order_details VALUES 
('OD001', 'ORD001', 'P001', 1, 99.99),
('OD002', 'ORD001', 'P002', 1, 199.99),
('OD003', 'ORD002', 'P003', 3, 19.99);

------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure SignUp 
@username varchar(50),@password varchar(50),@email varchar(100),@userType varchar(50),@address varchar(255),@phone varchar(20)
as
begin
	DECLARE @next_user_num INT = COALESCE(
    (SELECT MAX(CAST(SUBSTRING(user_id, 2, LEN(user_id)) AS INT)) FROM users), 
    0) + 1;
	DECLARE @new_user_id VARCHAR(10) = 'U' + RIGHT('000' + CAST(@next_user_num AS VARCHAR(3)), 3);
	insert into users values(@new_user_id,lower(@username),@password,@email,@userType);
	if(@userType='customer')
	begin
		DECLARE @next_cus_num INT = COALESCE(
		(SELECT MAX(CAST(SUBSTRING(customer_id, 2, LEN(customer_id)) AS INT)) FROM customers), 
		0) + 1;
		DECLARE @new_cus_id VARCHAR(10) = 'C' + RIGHT('000' + CAST(@next_cus_num AS VARCHAR(3)), 3);
		select @new_cus_id
		insert into customers values(@new_cus_id,@new_user_id,@username,@address,@phone)
	end;
	else
	begin
		DECLARE @next_ven_num INT = COALESCE(
		(SELECT MAX(CAST(SUBSTRING(vendor_id, 2, LEN(vendor_id)) AS INT)) FROM vendors), 
		0) + 1;
		DECLARE @new_ven_id VARCHAR(10) = 'V' + RIGHT('000' + CAST(@next_ven_num AS VARCHAR(3)), 3);
		select @new_ven_id
		insert into vendors values(@new_ven_id,@new_ven_id,@username,@address,@phone)
	end;
end;

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure Loginn
@email varchar(50),@password varchar(50)
as
begin
	declare @id varchar(6)
	declare @type varchar(10)
	declare @pass varchar(50)
	 DECLARE @message varchar(100)
	
	select @id=U.user_id,@type=U.user_type,@pass=U.password
	from users U
	where @email=U.email

	if @id is null or @password!=@pass
	begin
		SET @message = 'Invalid username or password.'
	end;
	else if @type='customer' and @password=@pass
	begin
		SET @message = 'Login successful as Customer.'
	end;
	else if  @type='vendor' and @password=@pass
	begin
		SET @message = 'Login successful as Vendor'
	end;
	SELECT 
        @id AS userId,
        @type AS userType,
        @message AS message
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
create procedure ViewProfile
@user_id varchar(6)
as
begin
    declare @user_type varchar(10);

    select @user_type = user_type
    from users
    where user_id = @user_id;

    if @user_type = 'customer'
    begin
        select c.customer_id,u.username,u.email,c.full_name,c.address,c.phone from customers c
        join users u
        on c.user_id = u.user_id
        where u.user_id = @user_id;
    end
    else if @user_type = 'vendor'
    begin
        select v.vendor_id,u.username,u.email,v.vendor_name,v.address,v.phone from vendors v
        join users u
        on v.user_id = u.user_id
        where u.user_id = @user_id;
    end
    else
    begin
        print 'Invalid user type or user ID.';
    end
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure get_product_catalogue
as
begin
    select P.product_id,P.product_name,V.vendor_name,C.category_name,P.price,P.description,P.image_url from products P
    join vendors V 
	on P.vendor_id = V.vendor_id
	join categories C 
	on P.category_id = C.category_id
    order by C.category_name, P.product_name;
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure get_filtered_catalogue
@p_name varchar(255) = null,
@p_category_name varchar(50) = null,
@p_vendor_name varchar(100) = null
as
begin
    select P.product_id,P.product_name,V.vendor_name,C.category_name,P.price,P.description from products P
	join vendors V 
	on P.vendor_id = V.vendor_id
	join categories C 
	on P.category_id = C.category_id
    where (c.category_name = @p_category_name or @p_category_name is null) and (v.vendor_name = @p_vendor_name or @p_vendor_name is null) and (P.product_name=@p_name or @p_name is null)
    order by C.category_name, P.product_name;
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure add_to_cart
    @p_customer_name varchar(100),
    @p_product_name varchar(255),
    @p_quantity int,
    @p_action varchar(10) = 'add'  -- 'add' or 'remove'
as
begin
    declare @customer_id varchar(6), @product_id varchar(6);

    -- get customer id from name
    select @customer_id = c.customer_id
    from customers c
    where lower(c.full_name) = lower(@p_customer_name);

    -- get product id from name
    select @product_id = p.product_id
    from products p
    where lower(p.product_name) = lower(@p_product_name);

    -- validate inputs
    if @customer_id is null
    begin
        raiserror('customer not found', 16, 1);
        return;
    end;

    if @product_id is null
    begin
        raiserror('product not found', 16, 1);
        return;
    end;

    if @p_quantity <= 0
    begin
        raiserror('quantity must be positive', 16, 1);
        return;
    end;

    -- handle cart action
    if @p_action = 'add'
    begin
        if exists (select 1 from shopping_carts where customer_id = @customer_id and product_id = @product_id)
        begin
            update shopping_carts
            set quantity = quantity + @p_quantity
            where customer_id = @customer_id
            and product_id = @product_id;
        end
        else if exists (select 1 from shopping_carts where customer_id = @customer_id)
        begin
           declare @cart_idd varchar(6)
		   select @cart_idd=shopping_carts.cart_id from shopping_carts
		   where shopping_carts.customer_id=@customer_id

		   if exists(select 1 from shopping_carts where customer_id = @customer_id and product_id = @product_id)
		   begin
				update shopping_carts
				set quantity =quantity+ @p_quantity
				where customer_id = @customer_id
				and @cart_idd=cart_id
			end;
			else if not exists(select 1 from shopping_carts where customer_id = @customer_id and product_id =@product_id )
			begin
				declare @cart varchar(6)
				select @cart=cart_id from shopping_carts where customer_id = @customer_id
				insert into shopping_carts values(@cart,@customer_id,@product_id,@p_quantity)
			end;
        end;
		else
		begin
			insert into shopping_carts (cart_id, customer_id, product_id, quantity)
            values (concat('SC', format((select count(*) from shopping_carts) + 1, '000')),@customer_id,@product_id,@p_quantity);
		end;
        print 'item added to cart';
    end
    else if @p_action = 'remove'
    begin
        delete from shopping_carts
        where customer_id = @customer_id
        and product_id = @product_id;
        
        print 'item removed from cart';
    end;
	else if @p_action='update'
	begin
		update shopping_carts
		set quantity =@p_quantity
		where customer_id = @customer_id
		and product_id = @product_id;
	end;
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ALTER PROCEDURE checkout
    @customerid VARCHAR(6),
    @payment VARCHAR(50)
AS
BEGIN
    DECLARE @cusid VARCHAR(6)
    DECLARE @message VARCHAR(20)
    
    SELECT @cusid = S.customer_id
    FROM shopping_carts S
    WHERE S.customer_id = @customerid

    IF @cusid IS NOT NULL
    BEGIN
        -- Existing logic to process the order
		declare @total float
		select @total=sum(S.quantity*P.price) from shopping_carts S
		join products P
		on S.product_id=P.product_id
		where S.customer_id=@customerid
		group by S.customer_id

		insert into orders values(concat('ORD', format((select count(*) from orders) + 1, '000')),@customerid,getdate(),@total,@payment,'pending')
		declare @orderid VARCHAR(6) = concat('ORD', format((select count(*) from orders)+0, '000'))
		DECLARE @base_count INT = ISNULL((SELECT COUNT(*) FROM order_details), 0);
		insert into order_details(order_detail_id, order_id, product_id, quantity, unit_price)
		select CONCAT('OD', FORMAT(@base_count + ROW_NUMBER() OVER (ORDER BY S.product_id), '000')),@orderid,S.product_id,S.quantity,P.price
		from shopping_carts S
		join products P
		on S.product_id=P.product_id
		where S.customer_id=@customerid

		delete from shopping_carts
		where customer_id=@customerid
        SET @message = 'Order Placed'
    END
    ELSE
    BEGIN
        SET @message = 'Customer not found'
    END

    -- Return the message
    SELECT @message AS message
END

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ALTER PROCEDURE get_cart_items
    @cus_id varchar(6)  -- CHANGED: Parameter changed from name to ID
AS
BEGIN
    SELECT 
        P.product_id,
        P.product_name,
        P.price,
        S.quantity,
        P.image_url,
        (P.price * S.quantity) AS total_price
    FROM shopping_carts S
    JOIN products P ON S.product_id = P.product_id
    JOIN customers C ON S.customer_id = C.customer_id
    WHERE C.customer_id = @cus_id  -- CHANGED: Filter by customer_id instead of username
END

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
create procedure get_orders
@customerid varchar(6)
as
begin
	select O.order_id,O.order_date,O.order_status,O.total_amount from Orders O
	where @customerid=O.customer_id
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter  procedure get_orders_details
@orderid varchar(6)
as
begin 
	select P.image_url,P.product_name,O.quantity,O.unit_price from order_details O
	join products P
	on O.product_id = P.product_id
	where @orderid=O.order_id
end

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter table customers add constraint fk_cus_us foreign key (user_id) references users(user_id) on delete cascade on update cascade
alter table vendors add constraint fk_cus_ven foreign key (user_id) references users(user_id) on delete cascade on update cascade
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE PROCEDURE getVenID
    @userid VARCHAR(6)
AS
BEGIN
    BEGIN TRY
        DECLARE @venId VARCHAR(6)
        
        SELECT @venId = V.vendor_id
        FROM vendors V
        WHERE @userid = V.user_id
        
        IF @venId IS NULL
            RAISERROR('Vendor not found for user', 16, 1)
        ELSE
            SELECT @venId AS vendor_id
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR(@ErrorMessage, 16, 1)
    END CATCH
END

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure addProduct
@vendor_id varchar(6),@product_id varchar(6),@product_name varchar(255),@cat_name varchar(50),@price decimal(10,2),@description varchar(500),@url varchar(100)
as
begin
	declare @catid varchar(6)
	declare @productid varchar(6)

	select @catid=C.category_id from categories C
	where @cat_name=C.category_name
	insert into products values(@product_id,@vendor_id,@product_name,@catid,@price,@description,@url)
	 SELECT 
            'Success' AS status,
            'Product added successfully' AS message,
            @product_id AS product_id;
end;

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
create procedure getCategories
as
begin
	select C.category_name from categories c
end;	

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
create procedure getVendorProducts
@vendor_id varchar(6)
as
begin
	 select P.product_id,P.product_name,V.vendor_name,C.category_name,P.price,P.description,P.image_url from products P
    join vendors V 
	on P.vendor_id = V.vendor_id
	join categories C 
	on P.category_id = C.category_id
	where @vendor_id=V.vendor_id
    order by C.category_name, P.product_name;
end;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure removeProducts
@product_id varchar(6)
as
begin
	declare @message varchar(50)
    if exists(select 1 from order_details where @product_id=product_id)
	begin
		set @message='Product cannot be deleted because it is in pending Orders.'
	end
	else
	begin
		delete products 
		where @product_id=product_id

		set @message='Product deleted successfully!'
	end
	SELECT @message AS message
end;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure get_vendor_orders
@vendor_id varchar(6)
as
begin
	select od.order_detail_id,o.order_status,od.unit_price,o.order_date,c.full_name,c.address,p.product_id,p.product_name,p.image_url,od.quantity,o.payment_method from order_details od
	join orders o
	on od.order_id=o.order_id
	join customers c
	on o.customer_id=c.customer_id
	join products p
	on od.product_id=p.product_id
	where p.vendor_id=@vendor_id
end;

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
alter procedure addCategory
@category_name varchar(50)
as
begin
	declare @message varchar(50)
	if exists(select 1 from categories where category_name=@category_name)
	begin
		set @message='Category already exists'
	end
	else
	begin
		declare @category_id varchar(6) =concat('CAT', format((select count(*) from categories) + 1, '000'))
		insert into categories values(@category_id,@category_name)
		set @message='Category Added Successfully'
	end
	SELECT @message AS message,
	@category_id as category_id
end

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
SELECT * FROM shopping_carts;
SELECT * FROM orders;
SELECT * FROM products;
SELECT * FROM order_details;
SELECT * FROM vendors;
SELECT * FROM users;
SELECT * FROM customers;
SELECT * FROM categories; delete categories where category_id='CAT006'