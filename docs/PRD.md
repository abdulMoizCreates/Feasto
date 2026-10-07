# FEASTO --- Product Requirements Document (PRD)

**Document:** PRD.md\
**Project:** Feasto\
**Status:** Build from scratch\
**Primary product type:** Food ordering / restaurant web application\
**Primary frontend:** React\
**Backend:** Supabase\
**Authentication:** Supabase Auth\
**Primary roles:** Customer and Admin

------------------------------------------------------------------------

# 1. Document Purpose

This document is the functional source of truth for Feasto.

The application must NOT be treated as three isolated screens such as:

-   Home
-   Menu
-   Dashboard

Feasto is a complete interconnected web application.

The final product consists of multiple pages, reusable components,
shared application logic, authentication, routing, data flow, customer
functionality, and an admin management area.

The implementation must therefore follow this hierarchy:

``` text
Code
  ↓
Reusable Components
  ↓
Components used by one or many pages
  ↓
Pages
  ↓
Interconnected Routes / User Flows
  ↓
Customer Application + Admin Application
  ↓
Complete Feasto Website
```

The goal is a real application architecture, not a collection of
visually similar static pages.

------------------------------------------------------------------------

# 2. Core Product Principle

Every part of Feasto has two dimensions:

``` text
Visual Design
+
Actual Functionality
```

A component is not considered complete just because it looks correct.

For example:

``` text
Admin Sidebar
    ↓
Orders
    ↓
/admin/orders
    ↓
Actual Orders Management Page
```

NOT:

``` text
Admin Sidebar
    ↓
Orders
    ↓
#orders
    ↓
Scroll to another section of Dashboard
```

Likewise:

``` text
Menu → Product → Cart → Checkout → Payment → Order Confirmation
```

must be an actual connected customer flow.

------------------------------------------------------------------------

# 3. Product Vision

Feasto should feel like a modern, polished food brand with a real
ordering system behind it.

The customer experience should be:

``` text
Discover
→ Browse
→ Search / Filter / Sort
→ Select food
→ Customize
→ Add to cart
→ Review cart
→ Checkout
→ Select delivery
→ Select payment
→ Place order
→ Confirmation
→ Track / view orders
```

The admin experience should be:

``` text
Sign in
→ Admin authentication
→ Dashboard
→ Manage orders
→ Manage menu
→ Manage categories
→ Manage customers
→ Manage reviews
→ Manage coupons
→ Reports
→ Users / Staff
→ Settings
```

------------------------------------------------------------------------

# 4. Application Modes

Feasto has exactly two primary application modes.

## 4.1 Customer Mode

The normal public/customer experience.

A customer can:

-   Visit the website.
-   Browse Home.
-   Browse Menu.
-   Search food.
-   Filter food.
-   Sort food.
-   View product details.
-   Customize supported options.
-   Add items to cart.
-   Manage cart.
-   Checkout.
-   Select delivery details.
-   Select payment method.
-   Place an order.
-   Sign up / sign in.
-   View their profile.
-   View their orders.
-   Submit ratings/reviews when authenticated.

------------------------------------------------------------------------

## 4.2 Admin Mode

Admin mode is a protected management application.

Only an authenticated admin can access it.

Admin can:

-   Access Dashboard.
-   Manage orders.
-   Manage menu items.
-   Manage categories.
-   Manage customers.
-   Manage reviews.
-   Manage coupons.
-   View reports.
-   Manage users where permitted.
-   Manage staff where implemented.
-   Manage settings.

### Critical rule

Being logged in does NOT automatically mean the user is an admin.

The application must distinguish:

``` text
customer
admin
```

and protect admin routes accordingly.

------------------------------------------------------------------------

# 5. Authentication

Supabase will be used for authentication.

The project owner is still learning Supabase, so the implementation
should be structured clearly enough that authentication logic can be
understood and maintained.

The implementation should separate:

``` text
Authentication
    ↓
Who is this user?

Authorization
    ↓
What is this user allowed to access?
```

### Customer

Can access customer-protected features.

### Admin

Can access:

``` text
/admin/*
```

only after successful authentication and role verification.

### Unauthorized behavior

If a non-admin attempts to access an admin route:

``` text
/admin/dashboard
/admin/orders
...
```

they must not be allowed to use the admin application.

Redirect them to an appropriate authentication/access page.

------------------------------------------------------------------------

# 6. Supabase Responsibility

Supabase is the intended backend.

Use Supabase for:

## Supabase Auth

-   Sign up.
-   Sign in.
-   Sign out.
-   Session management.
-   User identity.

## Supabase Database

Expected application entities include:

``` text
profiles / users
products
categories
orders
order_items
reviews
coupons
staff
```

Exact schema may be refined during implementation.

## Supabase Storage

May be used for:

-   Product images.
-   Admin-uploaded media.
-   Relevant application assets.

------------------------------------------------------------------------

# 7. High-Level Application Architecture

The architecture should be organized around reusable UI and domain
components.

Conceptually:

``` text
src/
│
├── assets/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── admin/
│   └── ...
│
├── pages/
│   ├── customer/
│   └── admin/
│
├── layouts/
│   ├── CustomerLayout
│   └── AdminLayout
│
├── context/
│   ├── CartContext
│   ├── AuthContext
│   └── ...
│
├── services/
│   ├── supabase
│   ├── products
│   ├── orders
│   ├── reviews
│   └── ...
│
├── data/
│
├── hooks/
│
├── utils/
│
└── routes/
```

This is a conceptual architecture, not an instruction to blindly create
every folder immediately.

The coding agent should inspect the current project and establish a
clean structure incrementally.

------------------------------------------------------------------------

# 8. Component Hierarchy

The application must have a clear component hierarchy.

Example:

``` text
ProductCard
    ↓
used by
    ├── Home
    ├── Menu
    ├── Search Results
    └── Related Products

Navbar
    ↓
CustomerLayout
    ↓
Customer Pages

AdminSidebar
    ↓
AdminLayout
    ↓
Admin Pages

CartItem
    ↓
Cart Page
    ↓
Checkout Summary
```

A component should be reusable when the same UI/behavior appears in
multiple places.

Avoid both extremes:

### Bad

One giant component containing the entire website.

### Also bad

Hundreds of tiny components that have no meaningful reuse or
responsibility.

Use logical component boundaries.

------------------------------------------------------------------------

# 9. Page Architecture

The website must contain more than Home, Menu, and Dashboard.

Exact page count can evolve, but the application should include the
following functional areas.

------------------------------------------------------------------------

# 10. Customer Pages

## Public pages

``` text
/
Home

/menu
Menu

/menu/:productId
Product Details

/offers
Offers

/about
About

/contact
Contact
```

## Shopping pages

``` text
/cart
Cart

/checkout
Checkout

/checkout/payment
Payment

/order-success
Order Confirmation
```

## Authentication pages

``` text
/login
Sign In

/signup
Sign Up
```

## Customer account

``` text
/profile
Profile

/orders
My Orders

/orders/:orderId
Order Details
```

Additional pages may be introduced if the UX requires them.

------------------------------------------------------------------------

# 11. Admin Pages

Admin has a separate protected application area.

``` text
/admin/dashboard
/admin/orders
/admin/orders/:orderId
/admin/menu
/admin/menu/new
/admin/menu/:productId/edit
/admin/categories
/admin/customers
/admin/customers/:customerId
/admin/reviews
/admin/coupons
/admin/reports
/admin/users
/admin/staff
/admin/settings
```

These are independent routes.

The sidebar links must point to these routes.

------------------------------------------------------------------------

# 12. Customer Navigation

The primary customer navbar is based on the supplied design.

Core links:

``` text
Home
Menu
Offers
About
Contact
Cart
Dashboard
```

The exact presentation of Dashboard may vary depending on
authentication/role.

### Navigation rule

A navbar link represents a destination.

It should not merely scroll to a random section unless the link is
explicitly a section anchor.

------------------------------------------------------------------------

# 13. Home Page

The supplied Home UI establishes the main Feasto customer-facing visual
language.

Required areas:

1.  Navbar.
2.  Hero.
3.  Quick category selection.
4.  Most Wanted products.
5.  Chef's Rotation.
6.  Three-step ordering explanation.
7.  Promotional banner.
8.  Footer.

Each major area should be implemented as a logical component.

Example:

``` text
HomePage
├── Navbar
├── HeroSection
├── QuickCategoryFinder
├── FeaturedProducts
├── ChefRotation
├── OrderingSteps
├── PromoBanner
└── Footer
```

------------------------------------------------------------------------

# 14. Menu Page

The Menu is a complete product browsing system.

Required:

-   Menu hero.
-   Search.
-   Category filter.
-   Rating filter.
-   Price range filter.
-   Sorting.
-   Product count/result state.
-   Product grid.
-   Pagination or appropriate result navigation.
-   Empty state.
-   Loading state.

Menu components should be reusable rather than written as repeated
page-specific markup.

------------------------------------------------------------------------

# 15. Menu Filters

## Categories

Required initial categories:

``` text
All Categories
Burgers
Pizza
Chicken
Fries
Drinks
Desserts
Salads
```

## Rating

``` text
4.5+
4.0+
3.5+
3.0+
```

## Price

A minimum and maximum price range.

## Clear filters

Restores default filter state.

Filters must work together.

Example:

``` text
Category = Burgers
+
Rating >= 4.5
+
Price <= 1000
```

should display products matching all active conditions.

------------------------------------------------------------------------

# 16. Search

Search should work against meaningful product information such as:

-   Name.
-   Category.
-   Description.

Search must combine correctly with filters and sorting.

Search is functionality, not decorative UI.

------------------------------------------------------------------------

# 17. Sorting

Initial options:

``` text
Most Popular
Highest Rated
Price: Low to High
Price: High to Low
Newest
```

Sorting applies to the currently visible filtered/search result set.

------------------------------------------------------------------------

# 18. Product Details

A product should have its own detail experience.

It should show:

-   Large product image.
-   Name.
-   Rating.
-   Description.
-   Price.
-   Availability.
-   Supported customization.
-   Quantity.
-   Add to cart.

Supported customization should remain intentionally limited to:

-   Size where applicable.
-   Drink selection/customization where applicable.

Do not build unnecessary complex customization systems.

------------------------------------------------------------------------

# 19. Cart

Cart must be a real shared application state.

Required:

-   Add item.
-   Quantity increase.
-   Quantity decrease.
-   Remove.
-   Selected customization preservation.
-   Subtotal.
-   Delivery fee where applicable.
-   Total.
-   Continue shopping.
-   Checkout.

The navbar cart indicator should reflect actual cart state.

------------------------------------------------------------------------

# 20. Checkout

Checkout should be its own page/flow.

Suggested structure:

``` text
Checkout
├── Customer information
├── Delivery details
├── Order summary
└── Continue to payment
```

Do not combine every checkout concern into an oversized component.

------------------------------------------------------------------------

# 21. Delivery

Customer must be able to provide the required delivery information.

Depending on final business rules:

-   Delivery address.
-   Contact information.
-   Delivery option.
-   Relevant delivery notes.

The selected delivery information must remain available to the order
submission flow.

------------------------------------------------------------------------

# 22. Payment

Payment must be represented as an explicit part of checkout.

Example flow:

``` text
Cart
→ Checkout
→ Payment
→ Place Order
→ Order Success
```

Supported payment methods should be defined by the actual
implementation.

Do not pretend that an unsupported payment gateway is working.

If real payment integration is not yet implemented, the UI must clearly
behave as a payment-selection stage without falsely claiming that money
was processed.

------------------------------------------------------------------------

# 23. Order Confirmation

After a successful order submission, show:

-   Order confirmation.
-   Order identifier.
-   Summary.
-   Delivery information.
-   Payment method.
-   Total.
-   Next action.

Possible next actions:

``` text
View order
Continue shopping
```

------------------------------------------------------------------------

# 24. Customer Orders

Customers should have:

``` text
/orders
```

for order history.

Each order can open:

``` text
/orders/:orderId
```

for details.

------------------------------------------------------------------------

# 25. Reviews

Authenticated customers may submit ratings/reviews.

Review data conceptually:

``` text
id
productId
userId
rating
review
createdAt
```

Admin can manage/moderate reviews.

Unauthenticated users should not be presented with a misleading "submit
review" flow.

------------------------------------------------------------------------

# 26. Admin Authentication Flow

Admin access should follow:

``` text
/admin/*
    ↓
Check Supabase session
    ↓
Check user role
    ↓
role === admin ?
    ├── yes → AdminLayout
    └── no → Access denied / redirect
```

The role check must not depend solely on hiding the UI.

Frontend route protection is necessary for UX, but backend/database
security must also enforce permissions.

------------------------------------------------------------------------

# 27. Admin Layout

Admin has a persistent application shell.

``` text
AdminLayout
├── AdminSidebar
├── AdminHeader
└── AdminPageContent
```

The sidebar stays conceptually separate from individual pages.

------------------------------------------------------------------------

# 28. Admin Dashboard

Dashboard is an overview/analytics page, not the entire admin
application.

Required visual/functional areas:

-   Greeting.
-   Search.
-   Notifications.
-   KPI cards.
-   Revenue overview.
-   Order status.
-   Recent orders.
-   Top selling items.
-   Sales by category.
-   Recent reviews.

Dashboard data should eventually be derived from real
application/database data.

------------------------------------------------------------------------

# 29. Admin Orders

Separate page.

Responsibilities:

-   List orders.
-   Search.
-   Filter by status.
-   View order details.
-   Update order status where authorized.

Possible statuses:

``` text
Pending
Preparing
On Delivery
Completed
```

------------------------------------------------------------------------

# 30. Admin Menu

Separate page.

Responsibilities:

-   List menu items.
-   Search.
-   Filter.
-   Add.
-   Edit.
-   Toggle availability.
-   Delete/archive where appropriate.

------------------------------------------------------------------------

# 31. Admin Categories

Separate page.

Responsibilities:

-   View categories.
-   Add.
-   Edit.
-   Archive/delete where safe.
-   Manage availability.

------------------------------------------------------------------------

# 32. Admin Customers

Separate page.

Display relevant customer information.

Possible fields:

-   Name.
-   Email.
-   Order count.
-   Total spend.
-   Account status.
-   Registration date.

Avoid exposing unnecessary sensitive information.

------------------------------------------------------------------------

# 33. Admin Reviews

Separate page.

Responsibilities:

-   View reviews.
-   Filter.
-   Inspect product/customer context.
-   Moderate where implemented.

------------------------------------------------------------------------

# 34. Admin Coupons

Separate page.

Coupon model can include:

``` text
code
discountType
discountValue
minimumOrder
startDate
endDate
isActive
```

Only implement behaviors actually supported by the application.

------------------------------------------------------------------------

# 35. Admin Reports

Separate page.

Possible reports:

-   Revenue.
-   Orders.
-   Product performance.
-   Category performance.
-   Time-based trends.

------------------------------------------------------------------------

# 36. Admin Users

Separate page for application user management where permitted.

Do not confuse:

``` text
Customer
User
Admin
Staff
```

These may overlap at the identity level but have different application
responsibilities.

------------------------------------------------------------------------

# 37. Admin Staff

Separate management page for restaurant staff where implemented.

------------------------------------------------------------------------

# 38. Admin Settings

Separate page.

Potential areas:

-   Restaurant details.
-   Delivery settings.
-   Payment configuration.
-   General application settings.

Only expose settings that are actually functional.

------------------------------------------------------------------------

# 39. Data Model

Initial product object:

``` text
id
name
description
price
category
rating
reviewCount
image
availability
badge
```

Order conceptually:

``` text
id
userId
items
subtotal
deliveryFee
total
deliveryDetails
paymentMethod
status
createdAt
```

The exact relational Supabase schema should be finalized before
production database integration.

------------------------------------------------------------------------

# 40. Data Source Strategy

During early UI development, local JSX/JavaScript data may be used to
make the interface functional.

Example:

``` text
data/products.js
```

Later:

``` text
local data
↓
Supabase queries
```

The UI should be designed so that moving from local data to Supabase
does not require rewriting every component.

------------------------------------------------------------------------

# 41. State Management

Shared state should have clear ownership.

Examples:

``` text
CartContext
→ cart state

AuthContext
→ session/user state

Filter state
→ Menu experience

Order state
→ checkout/order flow
```

Do not put the entire application state into one giant context.

------------------------------------------------------------------------

# 42. Routing Rules

Use React Router or the project's established routing solution.

Routes should represent application destinations.

Example:

``` text
/                 → Home
/menu             → Menu
/cart             → Cart
/checkout         → Checkout
/login            → Login
/admin/dashboard  → Admin Dashboard
/admin/orders     → Admin Orders
```

Use nested routes/layouts where they improve maintainability.

------------------------------------------------------------------------

# 43. Page-to-Page Interconnection

Important application flows:

### Customer discovery

``` text
Home
→ Category
→ Menu
→ Product
```

### Shopping

``` text
Product
→ Add to Cart
→ Cart
→ Checkout
→ Payment
→ Order Success
```

### Account

``` text
Login / Signup
→ Profile
→ Orders
→ Order Details
```

### Admin

``` text
Admin Sign In
→ Dashboard
→ Orders
→ Order Details
```

and:

``` text
Dashboard
→ Menu
→ Edit Product
```

etc.

All routes should be interconnected through real navigation.

------------------------------------------------------------------------

# 44. Error, Loading, and Empty States

Every data-dependent major page should account for:

``` text
Loading
Success
Empty
Error
```

Examples:

Menu empty:

``` text
No dishes found.
Try changing your filters.
[Clear filters]
```

Cart empty:

``` text
Your cart is empty.
[Explore menu]
```

Orders empty:

``` text
No orders yet.
[Browse menu]
```

------------------------------------------------------------------------

# 45. Responsive Requirements

The website must work on:

-   Desktop.
-   Tablet.
-   Mobile.

Customer and Admin layouts both require responsive behavior.

Admin sidebar should collapse appropriately on smaller screens.

Menu filters should become a drawer/expandable control on mobile.

Tables should remain usable without destroying readability.

------------------------------------------------------------------------

# 46. Security Requirements

Critical:

-   Never put Supabase service-role secrets in frontend code.
-   Use environment variables for public configuration.
-   Use Supabase Row Level Security where applicable.
-   Do not rely only on frontend checks for authorization.
-   Admin database operations must be protected by backend/database
    policies.
-   Customer data should only be accessible according to authorization
    rules.

------------------------------------------------------------------------

# 47. AI Coding Agent Rules

This project will be built with the help of a CLI/AI coding agent.

The agent MUST:

1.  Read `PRD.md`.
2.  Read `Design.md`.
3.  Inspect the existing repository.
4.  Inspect `src/Assets/`.
5.  Understand the architecture before making large changes.
6.  Build reusable components.
7.  Build pages around those components.
8.  Connect pages through real routing.
9.  Preserve working functionality.
10. Implement features completely rather than creating visual
    placeholders.
11. Verify the application after changes.
12. Avoid unnecessary rewrites.

The agent MUST NOT:

-   Build only Home, Menu, and Dashboard.
-   Treat the dashboard as the entire admin system.
-   Make sidebar links scroll to dashboard sections.
-   Create fake navigation.
-   Replace functionality with static mock buttons.
-   Invent unrelated pages merely to increase page count.
-   Create duplicate components for identical UI.
-   Rewrite the entire repository without first inspecting it.
-   Claim Supabase functionality works if it has not been
    connected/tested.
-   Add unnecessary libraries without justification.

------------------------------------------------------------------------

# 48. Implementation Order

Recommended implementation sequence:

``` text
1. Project audit
2. Design system / global styles
3. Application layouts
4. Routing architecture
5. Shared components
6. Customer Home
7. Menu + filters + sorting
8. Product details
9. Cart
10. Checkout
11. Payment stage
12. Order confirmation
13. Authentication UI
14. Supabase Auth
15. Customer account/orders
16. Admin authentication/authorization
17. Admin shell
18. Admin Dashboard
19. Admin Orders
20. Admin Menu
21. Admin Categories
22. Admin Customers
23. Admin Reviews
24. Admin Coupons
25. Admin Reports
26. Admin Users/Staff/Settings
27. Supabase database integration
28. Security/RLS
29. Responsive QA
30. Final visual + functional QA
```

This is a recommended sequence, not permission to skip earlier
architectural work.

------------------------------------------------------------------------

# 49. Definition of Done

Feasto is complete only when:

-   Customer application works.
-   Admin application works.
-   Admin authentication works.
-   Admin authorization works.
-   Routes are real.
-   Navigation is interconnected.
-   Components are reusable.
-   Menu filters work.
-   Sorting works.
-   Search works.
-   Cart works.
-   Checkout works.
-   Payment stage works honestly according to implementation.
-   Orders can be created/viewed.
-   Reviews work according to authentication rules.
-   Admin can manage the implemented resources.
-   Supabase integration is secure.
-   Responsive layouts work.
-   Loading/empty/error states exist.
-   The final UI follows `Design.md`.

A screenshot that merely looks correct is NOT a completed feature.

------------------------------------------------------------------------

# 50. Final Principle

Feasto must be developed as:

``` text
A SYSTEM
not
A COLLECTION OF SCREENS
```

The quality target is:

``` text
Clean architecture
+
Reusable components
+
Real routing
+
Real interactions
+
Authentication
+
Authorization
+
Supabase
+
Consistent design
+
Responsive UX
=
Complete Feasto
```
