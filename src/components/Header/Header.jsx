import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { logoutUser, fetchCategories, searchProducts } from "../../services/api";
import "./Header.css";
import { Search, ShoppingCart, User, ChevronDown, Truck, Mail } from "lucide-react";

function Header() {
  // ------------------- DROPDOWN STATES (DESKTOP) -------------------
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isBlogsOpen, setIsBlogsOpen] = useState(false);
  const [isInformationOpen, setIsInformationOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // ------------------- MOBILE MENU STATES -------------------
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mCategoriesOpen, setMCategoriesOpen] = useState(false);
  const [mServicesOpen, setMServicesOpen] = useState(false);
  const [mBlogsOpen, setMBlogsOpen] = useState(false);
  const [mInfoOpen, setMInfoOpen] = useState(false);

  // ------------------- USER STATES -------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");

  // ------------------- CATEGORY STATES -------------------
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ------------------- SEARCH STATES -------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { cartCount } = useCart();
  const navigate = useNavigate();

  // ------------------- LOAD INITIAL DATA -----------------
  useEffect(() => {
    const loginState = localStorage.getItem("isLoggedIn");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUsername = localStorage.getItem("username");

    setIsLoggedIn(loginState === "true" && !!accessToken && !!refreshToken);
    setUsername(storedUsername || "");

    const msg = localStorage.getItem("loginMessage");
    if (msg) {
      setLoginMessage(msg);
      localStorage.removeItem("loginMessage");
      setTimeout(() => setLoginMessage(""), 2000);
    }

    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.results || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Sync username (your existing logic)
  useEffect(() => {
    const syncUsername = () => {
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername || "");
    };

    window.addEventListener("storage", syncUsername);
    const interval = setInterval(syncUsername, 500);

    return () => {
      window.removeEventListener("storage", syncUsername);
      clearInterval(interval);
    };
  }, []);

  // ✅ Close mobile menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ Prevent background scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isMobileMenuOpen]);

  // ------------------- LOGOUT -------------------
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      const response = await logoutUser();
      if (response?.message === "Successfully logged out") {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setLogoutMessage("Logout successful.");
        setTimeout(() => {
          setLogoutMessage("");
          navigate("/");
        }, 1500);
      } else if (response?.detail === "Given token not valid for any token type") {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setLogoutMessage("Session expired. Please login again.");
        setTimeout(() => {
          setLogoutMessage("");
          navigate("/account/login");
        }, 1500);
      } else {
        console.error("Logout failed:", response.message || response.detail || response);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // ------------------- SEARCH SUGGESTIONS -------------------
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const data = await searchProducts(searchQuery, selectedCategory, 5);
        setSearchSuggestions(Array.isArray(data.results) ? data.results : []);
      } catch {
        setSearchSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(
      `/search?query=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(
        selectedCategory
      )}`
    );
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    navigate(`/product/${suggestion.id}`);
  };

  // ✅ helper: close mobile drawer after clicking any link
  const closeMobile = () => setIsMobileMenuOpen(false);

  // ------------------- RENDER -------------------
  return (
    <header className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="top-bar-left">
            <Mail size={14} /> sales@ElectroBoards.com
          </span>
          <span className="top-bar-center">Min Order value ₹99 | Free delivery above ₹1500</span>
     {isLoggedIn && (
  <Link to="/track-order" className="top-bar-link">
    <Truck size={20} />
    Track Order
  </Link>
)}
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="main-header-content">
          {/* Logo */}
          <div className="logo-container">
            <img
              src="/images/logo-electroboards.png"
              alt="ElectroBoards"
              className="logo-elec-trade"
            />
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by keyword, brand or SKU"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <select
              className="search-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {loadingCategories ? (
                <option>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>

            <button type="button" className="search-button" onClick={handleSearch}>
              <Search size={18} />
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.length >= 2 && (
              <div className="search-suggestions">
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onMouseDown={() => selectSuggestion(suggestion)}
                    >
                      {suggestion.name || suggestion.title || "Unnamed"}
                    </div>
                  ))
                ) : (
                  <div className="suggestion-item">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Account & Cart */}
          <div className="account-cart">
            <div
              className="dropdown-nav-item account-dropdown"
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <span className="account-title">
                <User size={18} />
                {isLoggedIn ? ` Hello, ${username}` : " My Account "}
                <ChevronDown size={14} />
              </span>

              {isAccountOpen && (
                <div className="dropdown-menu account-menu">
                  {!isLoggedIn && (
                    <>
                      <Link to="/account/login">Login</Link>
                      <Link to="/account/signup">Signup</Link>
                    </>
                  )}
                  {isLoggedIn && (
                    <>
                      <Link to="/account/orders">My Orders</Link>
                      <Link to="/account/profile">Profile</Link>
                      <Link to="/forgot-password">Change password</Link>
                      <span onClick={handleLogout} className="logout-link">
                        Logout
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            {isLoggedIn && (
              <>
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={18} /> Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          {/* ✅ MOBILE HAMBURGER */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            ☰ Menu
          </button>

          {/* ✅ DESKTOP NAV (Your original) */}
          <div className="desktop-nav">
            <Link to="/" className="nav-item">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div
              className="dropdown-nav-item"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <span>
                Categories <ChevronDown size={14} />
              </span>
              {isCategoriesOpen && (
                <div className="dropdown-menu">
                  {loadingCategories ? (
                    <p style={{ padding: "10px" }}>Loading categories...</p>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link key={cat.id} to={`/category/${cat.id}`}>
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p style={{ padding: "10px" }}>No categories found.</p>
                  )}
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              className="dropdown-nav-item"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <span>
                Services <ChevronDown size={14} />
              </span>
              {isServicesOpen && (
                <div className="dropdown-menu">
                  <Link to="/services/pcb">PCB Services</Link>
                  <Link to="/services/assembly">Assembly</Link>
                  <Link to="/services/custom">Custom Solutions</Link>
                </div>
              )}
            </div>

            {/* Blogs Dropdown */}
            <div
              className="dropdown-nav-item"
              onMouseEnter={() => setIsBlogsOpen(true)}
              onMouseLeave={() => setIsBlogsOpen(false)}
            >
              <span>
                Blogs <ChevronDown size={14} />
              </span>
              {isBlogsOpen && (
                <div className="dropdown-menu">
                  <Link to="/blogs/trends">Latest Trends</Link>
                  <Link to="/blogs/guides">How-to Guides</Link>
                </div>
              )}
            </div>

            {/* Information Dropdown */}
            <div
              className="dropdown-nav-item"
              onMouseEnter={() => setIsInformationOpen(true)}
              onMouseLeave={() => setIsInformationOpen(false)}
            >
              <span>
                Information <ChevronDown size={14} />
              </span>
              {isInformationOpen && (
                <div className="dropdown-menu">
                  <Link to="/info/about">About Us</Link>
                  <Link to="/info/contact">Contact Us</Link>
                  <Link to="/info/shipping">Shipping Policy</Link>
                </div>
              )}
            </div>

            <Link to="/helpdesk" className="nav-item">
              Helpdesk
            </Link>
            <Link to="/request-quotation" className="nav-item">
              Request for Quotation
            </Link>
          </div>
        </div>

        {/* ✅ MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer-overlay" onClick={closeMobile}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <span>Menu</span>
                <button className="close-btn" onClick={closeMobile} type="button">
                  ✕
                </button>
              </div>

              <Link to="/" onClick={closeMobile} className="m-link">
                Home
              </Link>

              {/* Categories */}
              <button
                className="m-collapsible"
                onClick={() => setMCategoriesOpen(!mCategoriesOpen)}
                type="button"
              >
                Categories <ChevronDown size={14} />
              </button>
              {mCategoriesOpen && (
                <div className="m-submenu">
                  {loadingCategories ? (
                    <div className="m-link">Loading...</div>
                  ) : (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        className="m-link"
                        onClick={closeMobile}
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              )}

              {/* Services */}
              <button
                className="m-collapsible"
                onClick={() => setMServicesOpen(!mServicesOpen)}
                type="button"
              >
                Services <ChevronDown size={14} />
              </button>
              {mServicesOpen && (
                <div className="m-submenu">
                  <Link to="/services/pcb" className="m-link" onClick={closeMobile}>
                    PCB Services
                  </Link>
                  <Link to="/services/assembly" className="m-link" onClick={closeMobile}>
                    Assembly
                  </Link>
                  <Link to="/services/custom" className="m-link" onClick={closeMobile}>
                    Custom Solutions
                  </Link>
                </div>
              )}

              {/* Blogs */}
              <button
                className="m-collapsible"
                onClick={() => setMBlogsOpen(!mBlogsOpen)}
                type="button"
              >
                Blogs <ChevronDown size={14} />
              </button>
              {mBlogsOpen && (
                <div className="m-submenu">
                  <Link to="/blogs/trends" className="m-link" onClick={closeMobile}>
                    Latest Trends
                  </Link>
                  <Link to="/blogs/guides" className="m-link" onClick={closeMobile}>
                    How-to Guides
                  </Link>
                </div>
              )}

              {/* Information */}
              <button
                className="m-collapsible"
                onClick={() => setMInfoOpen(!mInfoOpen)}
                type="button"
              >
                Information <ChevronDown size={14} />
              </button>
              {mInfoOpen && (
                <div className="m-submenu">
                  <Link to="/info/about" className="m-link" onClick={closeMobile}>
                    About Us
                  </Link>
                  <Link to="/info/contact" className="m-link" onClick={closeMobile}>
                    Contact Us
                  </Link>
                  <Link to="/info/shipping" className="m-link" onClick={closeMobile}>
                    Shipping Policy
                  </Link>
                </div>
              )}

              <Link to="/helpdesk" className="m-link" onClick={closeMobile}>
                Helpdesk
              </Link>
              <Link to="/request-quotation" className="m-link" onClick={closeMobile}>
                Request for Quotation
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Login message */}
      {loginMessage && <div className="login-message">{loginMessage}</div>}
      {/* Logout message */}
      {logoutMessage && <div className="logout-message">{logoutMessage}</div>}
    </header>
  );
}

export default Header;
