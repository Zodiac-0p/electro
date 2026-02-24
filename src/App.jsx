import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import WebLayout from "./layouts/WebLayout";
import AdminLayout from "./pages/admin/AdminLayout";

// Routes protection
import AdminRoute from "./routes/AdminRoute";

// Website pages
import Home from "./pages/Home/Home";
import About from "./pages/Info/About";
import AllProducts from "./pages/product/AllProducts";
import CategoryPage from "./pages/product/CategoryPage";
import ProductPage from "./pages/product/ProductPage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import VerifyAccount from "./pages/auth/VerifyAccount";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Cart from "./pages/cart/Cart";
import Payment from "./pages/cart/Payment";
import OrderSuccess from "./pages/cart/OrderSuccess";
import Profile from "./pages/profile/Profile";
import MyOrders from "./pages/profile/MyOrders";
import OrderDetail from "./pages/profile/OrderDetails";
import SearchResultsPage from "./components/SearchResults/SearchResultsPage";
import RequestQuotation from "./pages/RequestQuotation/RequestQuotation";
import Helpdesk from "./pages/Helpdesk/Helpdesk";
import Contact from "./pages/Info/Contact";
import ShippingPolicy from "./pages/Info/ShippingPolicy";
import TrackOrder from "./pages/TrackOrder/TrackOrder";
import PrivacyPolicy from "./pages/Info/PrivacyPolicy";
import RefundPolicy from "./pages/Info/RefundPolicy";
import TermsOfService from "./pages/Info/TermsOfService";
import VerifyPhone from "./pages/auth/Temp";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import ProductCreate from "./pages/admin/ProductCreate";

// Context
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>

          {/* ================= WEBSITE ================= */}
          <Route element={<WebLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/AllProducts" element={<AllProducts />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />

            <Route path="/account/login" element={<Login />} />
            <Route path="/account/signup" element={<SignUp />} />
            <Route path="/verify/:uid/:token" element={<VerifyAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/account/profile" element={<Profile />} />
            <Route path="/account/orders" element={<MyOrders />} />
            <Route path="/account/orders/:id" element={<OrderDetail />} />

            {/* Info pages (About already mapped at /about) */}
            <Route path="/info/about" element={<About />} />
            <Route path="/info/contact" element={<Contact />} />
            <Route path="/info/shipping" element={<ShippingPolicy />} />

            {/* Legacy / footer links */}
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Payment />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/request-quotation" element={<RequestQuotation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/track-order/:id" element={<TrackOrder />} />

            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/info/privacy" element={<PrivacyPolicy />} />
            <Route path="/info/refund" element={<RefundPolicy />} />
            <Route path="/info/terms" element={<TermsOfService />} />
            <Route path="/verify-phone" element={<VerifyPhone />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductCreate />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

