import { useEffect, useState } from "react";
import "./Home.css";
import { Lottie } from "lottie-react";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || ""
).replace(/\/+$/, "");

const services = [
    {
        title: "Smart Billing",
        description: "Automate invoices, payments, and billing operations.",
        image: "/01-billing-erp.svg",
    },
    {
        title: "Digital Marketing",
        description: "Reach more customers and grow your online presence.",
        image: "/02-digital-marketing.svg",
    },
    {
        title: "Lead Management",
        description: "Track potential customers and manage sales opportunities.",
        image: "/03-lead-management.svg",
    },
    {
        title: "Web App Development",
        description: "Build modern web applications for your business needs.",
        image: "/04-web-app-development.svg",
    },
    {
        title: "Full-Stack Internship",
        description: "Develop practical skills in frontend and backend technologies.",
        image: "/05-fullstack-internship.svg",
    },
    {
        title: "Workflow Automation",
        description: "Automate repetitive tasks and streamline daily operations.",
        image: "/06-workflow-automation.svg",
    },
];

export default function Home() {
    const [activeService, setActiveService] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const [chatOpen, setChatOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        service: "",
        message: "",
    });

    // Load the Lottie JSON from the public folder.
    const [handshakeAnimation, setHandshakeAnimation] = useState(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/handshake-success.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load Lottie animation");
                }
                return response.json();
            })
            .then((data) => {
                if (!cancelled) {
                    setHandshakeAnimation(data);
                }
            })
            .catch((error) => {
                console.error("Lottie animation loading failed:", error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Choose how many service cards fit on the screen.
    useEffect(() => {
        const updateCardsPerView = () => {
            if (window.innerWidth <= 600) {
                setCardsPerView(1);
            } else if (window.innerWidth <= 900) {
                setCardsPerView(2);
            } else {
                setCardsPerView(3);
            }
        };

        updateCardsPerView();
        window.addEventListener("resize", updateCardsPerView);

        return () => {
            window.removeEventListener("resize", updateCardsPerView);
        };
    }, []);

    const maxServiceIndex = Math.max(
        0,
        services.length - cardsPerView
    );

    // Keep the carousel position valid after resizing.
    useEffect(() => {
        setActiveService((current) =>
            Math.min(current, maxServiceIndex)
        );
    }, [maxServiceIndex]);

    // Automatically move the carousel every 3 seconds.
    useEffect(() => {
        if (maxServiceIndex === 0) return;

        const timer = setInterval(() => {
            setActiveService((current) =>
                current >= maxServiceIndex ? 0 : current + 1
            );
        }, 3000);

        return () => clearInterval(timer);
    }, [maxServiceIndex]);

    // Update form fields.
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Submit the enquiry to the backend.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/leads`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        service: formData.service,
                        requirements: formData.message,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit enquiry");
            }

            setChatOpen(false);
            setShowSuccess(true);

            setFormData({
                name: "",
                email: "",
                service: "",
                message: "",
            });
        } catch (error) {
            console.error("Enquiry submission failed:", error);

            alert(
                "Could not submit your enquiry. Check that your backend is running and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Set the selected service in the enquiry form.
    const selectService = (serviceTitle) => {
        setFormData((previous) => ({
            ...previous,
            service: serviceTitle,
        }));
    };

    // Carousel positioning.
    const carouselStyle = {
        transform: `translateX(-${activeService * (100 / services.length)}%)`,
    };

    return (
        <div className="crm-home" id="home">
            {/* Navigation */}
            <nav className="navbar">
                <a href="#home" className="logo">
                    <span className="logo-icon">✦</span>
                    HIG <span className="logo-ai">AI</span>
                </a>

                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#services">Services</a>
                    <a href="#workflow">How It Works</a>
                    <a href="#contact">Contact</a>
                </div>

                <a href="/admin-login" className="nav-button">
                    Admin Login <span>↗</span>
                </a>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <div className="eyebrow">
                        <span className="status-dot" />
                        INTELLIGENT BUSINESS MANAGEMENT
                    </div>

                    <h1>
                        Run your business.
                        <br />
                        <span>Not your busywork.</span>
                    </h1>

                    <p className="hero-description">
                        Bring your customers, sales, inventory, and business
                        operations together with one intelligent CRM platform.
                    </p>

                    <div className="hero-actions">
                        <a href="#services" className="primary-button">
                            Explore Services <span>↗</span>
                        </a>

                        <a href="#workflow" className="secondary-button">
                            See how it works <span>→</span>
                        </a>
                    </div>

                    <div className="hero-trust">
                        <div className="trust-icon">✓</div>
                        <span>
                            One platform. Smarter decisions. Better growth.
                        </span>
                    </div>
                </div>

                {/* Dashboard illustration */}
                <div className="dashboard-wrap">
                    <div className="dashboard-glow" />

                    <div className="dashboard">
                        <div className="dashboard-top">
                            <div>
                                <div className="dashboard-label">
                                    BUSINESS OVERVIEW
                                </div>

                                <h3>Good morning 👋</h3>

                                <p>
                                    Here's what's happening with your business.
                                </p>
                            </div>

                            <div className="dashboard-avatar">N</div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <span>Total Revenue</span>
                                <strong>₹2,45,800</strong>
                                <small className="positive">↗ 12.8%</small>
                            </div>

                            <div className="stat-card">
                                <span>Total Customers</span>
                                <strong>1,284</strong>
                                <small className="positive">↗ 8.2%</small>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-heading">
                                <div>
                                    <strong>Revenue Overview</strong>
                                    <p>Business performance</p>
                                </div>

                                <span className="chart-period">
                                    This week⌄
                                </span>
                            </div>

                            <svg
                                className="revenue-chart"
                                viewBox="0 0 420 150"
                                role="img"
                                aria-label="Illustrative revenue growth chart"
                            >
                                <defs>
                                    <linearGradient
                                        id="revenueFill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#9878ff"
                                            stopOpacity="0.35"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#9878ff"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>

                                {[25, 60, 95, 130].map((y) => (
                                    <line
                                        key={y}
                                        x1="10"
                                        y1={y}
                                        x2="410"
                                        y2={y}
                                        stroke="#e9e7f3"
                                        strokeDasharray="4 5"
                                    />
                                ))}

                                <path
                                    d="M10 118 C40 110,50 80,85 92 S130 105,160 65 S210 88,240 52 S290 70,320 38 S370 55,410 15 L410 140 L10 140 Z"
                                    fill="url(#revenueFill)"
                                />

                                <path
                                    d="M10 118 C40 110,50 80,85 92 S130 105,160 65 S210 88,240 52 S290 70,320 38 S370 55,410 15"
                                    fill="none"
                                    stroke="#8865ee"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />

                                <circle
                                    cx="320"
                                    cy="38"
                                    r="5"
                                    fill="#27e4df"
                                />
                            </svg>

                            <div className="chart-labels">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>

                        <div className="dashboard-footer">
                            <span className="status-dot" />
                            Your business overview at a glance
                        </div>
                    </div>

                    <div className="floating-note">
                        <span className="note-icon">✦</span>
                        <div>
                            <strong>AI Insights</strong>
                            <p>Business trends at a glance</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="services-section" id="services">
                <div className="section-heading">
                    <div className="eyebrow">
                        <span className="status-dot" />
                        EVERYTHING IN ONE PLACE
                    </div>

                    <h2>
                        Your business, <span>simplified.</span>
                    </h2>

                    <p>
                        Powerful tools designed to make everyday business
                        management easier.
                    </p>
                </div>

                <div className="services-carousel">
                    <div className="carousel-window">
                        <div
                            className="carousel-track"
                            style={carouselStyle}
                        >
                            {services.map((service, index) => (
                                <article
                                    className="service-card"
                                    key={service.title}
                                >
                                    <div className="service-image">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            loading="lazy"
                                        />

                                        <span className="service-number">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <div className="service-card-content">
                                        <h3>{service.title}</h3>
                                        <p>{service.description}</p>

                                        <a
                                            href="#contact"
                                            className="service-link"
                                            onClick={() =>
                                                selectService(service.title)
                                            }
                                        >
                                            Learn more <span>↗</span>
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="carousel-controls">
                        <div className="carousel-dots">
                            {Array.from({
                                length: maxServiceIndex + 1,
                            }).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`carousel-dot ${activeService === index ? "active" : ""
                                        }`}
                                    onClick={() => setActiveService(index)}
                                    aria-label={`Show services starting at ${index + 1}`}
                                    aria-current={
                                        activeService === index
                                            ? "true"
                                            : undefined
                                    }
                                />
                            ))}
                        </div>

                        <div className="carousel-arrows">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveService((current) =>
                                        current === 0
                                            ? maxServiceIndex
                                            : current - 1
                                    )
                                }
                                aria-label="Previous services"
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveService((current) =>
                                        current >= maxServiceIndex
                                            ? 0
                                            : current + 1
                                    )
                                }
                                aria-label="Next services"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="workflow-section" id="workflow">
                <div className="section-heading">
                    <div className="eyebrow">
                        <span className="status-dot" />
                        SIMPLE BY DESIGN
                    </div>

                    <h2>
                        Get started in <span>three steps.</span>
                    </h2>

                    <p>
                        A simple workflow to help you organize your business.
                    </p>
                </div>

                <div className="workflow-grid">
                    <div className="workflow-card">
                        <span className="step-number">01</span>
                        <div className="step-icon">◎</div>
                        <h3>Bring your data</h3>
                        <p>
                            Organize your customer and business information in
                            one place.
                        </p>
                    </div>

                    <div className="workflow-card">
                        <span className="step-number">02</span>
                        <div className="step-icon">✦</div>
                        <h3>Automate your work</h3>
                        <p>
                            Simplify repetitive tasks and streamline daily
                            business activities.
                        </p>
                    </div>

                    <div className="workflow-card">
                        <span className="step-number">03</span>
                        <div className="step-icon">↗</div>
                        <h3>Grow with insights</h3>
                        <p>
                            Use clear business information to make better
                            decisions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="contact-section" id="contact">
                <div className="contact-content">
                    <div className="eyebrow">
                        <span className="status-dot" />
                        READY TO GET STARTED?
                    </div>

                    <h2>
                        Make room for <span>better business.</span>
                    </h2>

                    <p>
                        Discover a simpler way to manage your business with
                        HIG AI.
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => setChatOpen(true)}
                    >
                        Talk to us <span>↗</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <a href="#home" className="logo">
                    <span className="logo-icon">✦</span>
                    HIG <span className="logo-ai">AI</span>
                </a>

                <p>Smarter workflows. Better business.</p>

                <span className="copyright">
                    © {new Date().getFullYear()} HIG AI
                </span>
            </footer>

            {/* Floating chatbot button */}
            <button
                type="button"
                className="chat-button"
                onClick={() => setChatOpen((open) => !open)}
                aria-label={chatOpen ? "Close chat" : "Open chat"}
                aria-expanded={chatOpen}
            >
                {chatOpen ? "×" : "🐱"}
            </button>

            {/* Enquiry panel */}
            {chatOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div>
                            <strong>HIG AI Assistant 🐱</strong>
                            <p>Let's find the right service for you.</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setChatOpen(false)}
                            aria-label="Close enquiry form"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="chat-form">
                        <p className="chat-question">
                            Hi there! 👋 Which service are you interested in?
                        </p>

                        <label htmlFor="lead-service">
                            Choose a service
                        </label>

                        <select
                            id="lead-service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a service</option>

                            {services.map((service) => (
                                <option
                                    key={service.title}
                                    value={service.title}
                                >
                                    {service.title}
                                </option>
                            ))}

                            <option value="Other">
                                Other / General Enquiry
                            </option>
                        </select>

                        <label htmlFor="lead-name">Your name</label>

                        <input
                            id="lead-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />

                        <label htmlFor="lead-email">Email address</label>

                        <input
                            id="lead-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />

                        <label htmlFor="lead-message">Tell us more</label>

                        <textarea
                            id="lead-message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="What would you like help with?"
                            rows={3}
                            required
                        />

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : "Submit enquiry"}
                            {!isSubmitting && <span>↗</span>}
                        </button>
                    </form>
                </div>
            )}

            {/* Lottie success popup */}
            {showSuccess && (
                <div
                    className="success-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="success-title"
                >
                    <div className="success-card">
                        <button
                            type="button"
                            className="success-close"
                            onClick={() => setShowSuccess(false)}
                            aria-label="Close success message"
                        >
                            ×
                        </button>

                        {handshakeAnimation ? (
                            <Lottie
                                animationData={handshakeAnimation}
                                autoplay
                                loop={false}
                                style={{
                                    width: "220px",
                                    height: "220px",
                                    margin: "0 auto",
                                }}
                            />
                        ) : (
                            <div className="success-fallback" aria-hidden="true">
                                ✓
                            </div>
                        )}

                        <p className="success-eyebrow">
                            HIG AI · CONNECTION ESTABLISHED
                        </p>

                        <h2 id="success-title">
                            Let's build something{" "}
                            <span>great together.</span>
                        </h2>

                        <p className="success-description">
                            Your enquiry has been submitted successfully.
                            Our team looks forward to connecting with you.
                        </p>

                        <button
                            type="button"
                            className="success-button"
                            onClick={() => setShowSuccess(false)}
                        >
                            Continue exploring <span>→</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
