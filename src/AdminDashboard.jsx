
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/leads";

const STATUSES = ["New", "Contacted", "Converted"];

function getLeadId(lead) {
    return lead._id ?? lead.id ?? lead.leadId;
}

function normalizeStatus(status) {
    const value = String(status ?? "New").toLowerCase();

    if (value === "contacted") return "Contacted";
    if (value === "converted") return "Converted";
    return "New";
}

function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function AdminDashboard() {
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedLead, setSelectedLead] = useState(null);
    const [updatingLeadId, setUpdatingLeadId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getToken = () => localStorage.getItem("adminToken");

    const handleUnauthorized = useCallback(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin-login", { replace: true });
    }, [navigate]);

    const fetchLeads = useCallback(async () => {
        const token = getToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 401 || response.status === 403) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load leads. Please try again.");
            }

            const data = await response.json();

            const leadList = Array.isArray(data)
                ? data
                : Array.isArray(data.leads)
                    ? data.leads
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

            setLeads(leadList);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [handleUnauthorized]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const stats = useMemo(() => {
        return {
            total: leads.length,
            newLeads: leads.filter(
                (lead) => normalizeStatus(lead.status) === "New"
            ).length,
            contacted: leads.filter(
                (lead) => normalizeStatus(lead.status) === "Contacted"
            ).length,
            converted: leads.filter(
                (lead) => normalizeStatus(lead.status) === "Converted"
            ).length,
        };
    }, [leads]);

    const filteredLeads = useMemo(() => {
        const query = search.trim().toLowerCase();

        return leads.filter((lead) => {
            const searchableFields = [
                lead.name,
                lead.fullName,
                lead.email,
                lead.phone,
                lead.service,
                lead.subject,
                lead.requirements,
                lead.message,
            ];

            const matchesSearch =
                !query ||
                searchableFields.some((value) =>
                    String(value ?? "").toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "All" ||
                normalizeStatus(lead.status) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leads, search, statusFilter]);

    const updateLeadStatus = async (lead, newStatus) => {
        const leadId = getLeadId(lead);

        if (!leadId) {
            setError("This lead does not have a valid ID.");
            return;
        }

        const token = getToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        const previousLeads = leads;

        setUpdatingLeadId(leadId);
        setError("");

        // Update the UI immediately while the server processes the request.
        setLeads((currentLeads) =>
            currentLeads.map((item) =>
                String(getLeadId(item)) === String(leadId)
                    ? { ...item, status: newStatus }
                    : item
            )
        );

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(leadId)}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (response.status === 401 || response.status === 403) {
                setLeads(previousLeads);
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error("Could not update the lead status.");
            }

            const result = await response.json().catch(() => null);

            if (result?.lead) {
                setLeads((currentLeads) =>
                    currentLeads.map((item) =>
                        String(getLeadId(item)) === String(leadId)
                            ? { ...item, ...result.lead }
                            : item
                    )
                );
            }

            if (
                selectedLead &&
                String(getLeadId(selectedLead)) === String(leadId)
            ) {
                setSelectedLead((current) =>
                    current ? { ...current, status: newStatus } : current
                );
            }
        } catch (err) {
            setLeads(previousLeads);
            setError(err.message || "Status update failed.");
        } finally {
            setUpdatingLeadId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin-login", { replace: true });
    };

    return (
        <div className="crm-layout">
            {sidebarOpen && (
                <button
                    className="crm-sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`crm-sidebar ${sidebarOpen ? "is-open" : ""}`}>
                <div className="crm-brand">
                    <div className="crm-brand-logo">H</div>
                    <div>
                        <h2>HIG CRM</h2>
                        <span>Customer management</span>
                    </div>
                </div>

                <div className="crm-nav-label">WORKSPACE</div>

                <nav className="crm-nav">
                    <button
                        className="crm-nav-item active"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="crm-nav-icon">▦</span>
                        Dashboard
                    </button>

                    <button
                        className="crm-nav-item"
                        onClick={() => {
                            document
                                .getElementById("crm-leads")
                                ?.scrollIntoView({ behavior: "smooth" });
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="crm-nav-icon">♙</span>
                        All Leads
                        <span className="crm-nav-count">{stats.total}</span>
                    </button>
                </nav>

                <div className="crm-sidebar-bottom">
                    <div className="crm-admin-profile">
                        <div className="crm-avatar">A</div>
                        <div className="crm-admin-info">
                            <strong>Administrator</strong>
                            <span>Admin account</span>
                        </div>
                    </div>

                    <button className="crm-logout-button" onClick={handleLogout}>
                        <span>↪</span>
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="crm-main">
                <header className="crm-topbar">
                    <button
                        className="crm-menu-button"
                        aria-label="Open navigation"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>

                    <div className="crm-topbar-title">
                        <span>HIG CRM</span>
                        <span className="crm-breadcrumb-separator">/</span>
                        <span>Dashboard</span>
                    </div>

                    <button className="crm-refresh-button" onClick={fetchLeads}>
                        <span>↻</span>
                        Refresh
                    </button>
                </header>

                <div className="crm-content">
                    <section className="crm-page-header">
                        <div className="crm-page-heading">
                            <span className="crm-page-eyebrow">OVERVIEW</span>
                            <h1>Welcome back, Admin 👋</h1>
                            <p>Manage your customer enquiries and follow-ups.</p>
                        </div>
                    </section>

                    {error && (
                        <div className="crm-error-message" role="alert">
                            <span>{error}</span>
                            <button onClick={() => setError("")} aria-label="Dismiss error">
                                ×
                            </button>
                        </div>
                    )}

                    {/* KPI CARDS: displayed above the leads table */}
                    <section className="crm-stats-grid" aria-label="Lead statistics">
                        <article className="crm-stat-card">
                            <div className="crm-stat-top">
                                <span className="crm-stat-label">Total Leads</span>
                                <span className="crm-stat-icon purple">♙</span>
                            </div>
                            <div className="crm-stat-value">
                                {loading ? "—" : stats.total}
                            </div>
                            <div className="crm-stat-caption">All customer enquiries</div>
                        </article>

                        <article className="crm-stat-card">
                            <div className="crm-stat-top">
                                <span className="crm-stat-label">New Leads</span>
                                <span className="crm-stat-icon blue">✦</span>
                            </div>
                            <div className="crm-stat-value">
                                {loading ? "—" : stats.newLeads}
                            </div>
                            <div className="crm-stat-caption">Awaiting follow-up</div>
                        </article>

                        <article className="crm-stat-card">
                            <div className="crm-stat-top">
                                <span className="crm-stat-label">Contacted</span>
                                <span className="crm-stat-icon orange">↗</span>
                            </div>
                            <div className="crm-stat-value">
                                {loading ? "—" : stats.contacted}
                            </div>
                            <div className="crm-stat-caption">Follow-up in progress</div>
                        </article>

                        <article className="crm-stat-card">
                            <div className="crm-stat-top">
                                <span className="crm-stat-label">Converted</span>
                                <span className="crm-stat-icon green">✓</span>
                            </div>
                            <div className="crm-stat-value">
                                {loading ? "—" : stats.converted}
                            </div>
                            <div className="crm-stat-caption">Successfully converted</div>
                        </article>
                    </section>

                    {/* ALL LEADS TABLE: displayed below the KPI cards */}
                    <section className="crm-leads-section" id="crm-leads">
                        <div className="crm-leads-header">
                            <div>
                                <h2>All Leads</h2>
                                <p>View and manage your customer enquiries.</p>
                            </div>

                            <span className="crm-leads-total">
                                {filteredLeads.length} leads
                            </span>
                        </div>

                        <div className="crm-toolbar">
                            <div className="crm-search-wrapper">
                                <span className="crm-search-icon">⌕</span>
                                <input
                                    type="search"
                                    className="crm-search-input"
                                    placeholder="Search name, email, phone..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    aria-label="Search leads"
                                />
                            </div>

                            <select
                                className="crm-status-filter"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                aria-label="Filter leads by status"
                            >
                                <option value="All">All statuses</option>
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="crm-state-message">
                                <span className="crm-spinner" />
                                <p>Loading customer enquiries...</p>
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="crm-state-message">
                                <div className="crm-empty-icon">♙</div>
                                <h3>No leads yet</h3>
                                <p>Customer enquiries will appear here when available.</p>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="crm-state-message">
                                <h3>No matching leads</h3>
                                <p>Try another search term or status filter.</p>
                                <button
                                    className="crm-reset-button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("All");
                                    }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="crm-table-wrapper">
                                <table className="crm-leads-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Service</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredLeads.map((lead) => {
                                            const leadId = getLeadId(lead);
                                            const status = normalizeStatus(lead.status);
                                            const customerName =
                                                lead.name || lead.fullName || "Unnamed customer";

                                            return (
                                                <tr key={leadId ?? `${lead.email}-${customerName}`}>
                                                    <td>
                                                        <div className="crm-customer-cell">
                                                            <div className="crm-customer-avatar">
                                                                {customerName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="crm-customer-info">
                                                                <strong>{customerName}</strong>
                                                                <span>{lead.email || "No email provided"}</span>
                                                                {lead.phone && (
                                                                    <span>{lead.phone}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="crm-service-name">
                                                            {lead.service || lead.subject || "General enquiry"}
                                                        </span>
                                                    </td>

                                                    <td className="crm-date-cell">
                                                        {formatDate(
                                                            lead.createdAt ||
                                                            lead.created_at ||
                                                            lead.date
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`crm-status-badge ${status.toLowerCase()}`}
                                                        >
                                                            <span className="crm-status-dot" />
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="crm-row-actions">
                                                            <select
                                                                className="crm-row-status-select"
                                                                aria-label={`Change status for ${customerName}`}
                                                                value={status}
                                                                disabled={updatingLeadId === leadId}
                                                                onChange={(event) =>
                                                                    updateLeadStatus(lead, event.target.value)
                                                                }
                                                            >
                                                                {STATUSES.map((option) => (
                                                                    <option key={option} value={option}>
                                                                        {option}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button
                                                                className="crm-view-button"
                                                                onClick={() => setSelectedLead(lead)}
                                                                aria-label={`View ${customerName}`}
                                                                title="View details"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="crm-table-footer">
                            Showing {loading ? 0 : filteredLeads.length} of{" "}
                            {loading ? "—" : leads.length} leads
                        </div>
                    </section>

                    <footer className="crm-footer">
                        <span>HIG CRM · Customer Management</span>
                        <span>Dashboard</span>
                    </footer>
                </div>
            </main>

            {selectedLead && (
                <div
                    className="crm-modal-backdrop"
                    onClick={() => setSelectedLead(null)}
                    role="presentation"
                >
                    <section
                        className="crm-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="crm-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="crm-modal-header">
                            <div>
                                <span className="crm-page-eyebrow">CUSTOMER INFORMATION</span>
                                <h2 id="crm-modal-title">Lead details</h2>
                            </div>

                            <button
                                className="crm-modal-close"
                                onClick={() => setSelectedLead(null)}
                                aria-label="Close lead details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="crm-modal-customer">
                            <div className="crm-modal-avatar">
                                {(
                                    selectedLead.name ||
                                    selectedLead.fullName ||
                                    "C"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>
                                    {selectedLead.name ||
                                        selectedLead.fullName ||
                                        "Unnamed customer"}
                                </h3>
                                <span>Customer enquiry</span>
                            </div>
                        </div>

                        <div className="crm-details-grid">
                            <div className="crm-detail-item">
                                <span>Email address</span>
                                <strong>{selectedLead.email || "Not provided"}</strong>
                            </div>

                            <div className="crm-detail-item">
                                <span>Phone number</span>
                                <strong>{selectedLead.phone || "Not provided"}</strong>
                            </div>

                            <div className="crm-detail-item">
                                <span>Service</span>
                                <strong>
                                    {selectedLead.service ||
                                        selectedLead.subject ||
                                        "General enquiry"}
                                </strong>
                            </div>

                            <div className="crm-detail-item">
                                <span>Date received</span>
                                <strong>
                                    {formatDate(
                                        selectedLead.createdAt ||
                                        selectedLead.created_at ||
                                        selectedLead.date
                                    )}
                                </strong>
                            </div>

                            <div className="crm-detail-item">
                                <span>Status</span>
                                <span
                                    className={`crm-status-badge ${normalizeStatus(
                                        selectedLead.status
                                    ).toLowerCase()}`}
                                >
                                    <span className="crm-status-dot" />
                                    {normalizeStatus(selectedLead.status)}
                                </span>
                            </div>
                        </div>

                        <div className="crm-requirements">
                            <span>Requirements / Message</span>
                            <p>
                                {selectedLead.requirements ||
                                    selectedLead.message ||
                                    selectedLead.description ||
                                    "No additional requirements provided."}
                            </p>
                        </div>

                        <div className="crm-modal-actions">
                            <label htmlFor="crm-modal-status">Update status</label>
                            <select
                                id="crm-modal-status"
                                className="crm-status-filter"
                                value={normalizeStatus(selectedLead.status)}
                                disabled={
                                    updatingLeadId === getLeadId(selectedLead)
                                }
                                onChange={(event) =>
                                    updateLeadStatus(selectedLead, event.target.value)
                                }
                            >
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="crm-modal-done"
                                onClick={() => setSelectedLead(null)}
                            >
                                Done
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
