import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../services/api';
import OpportunityRow from '../components/OpportunityCard';
import OpportunityForm from '../components/OpportunityForm';
import Modal from '../components/Modal';
import { STAGES, PRIORITIES, formatCurrency, extractErrorMessage } from '../utils';

const Dashboard = () => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      };
      if (stageFilter) params.stage = stageFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await getOpportunities(params);
      setOpportunities(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load opportunities'));
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, stageFilter, priorityFilter, search]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Debounce search input slightly by resetting page on filter change
  useEffect(() => {
    setPage(1);
  }, [stageFilter, priorityFilter, search]);

  const summary = useMemo(() => {
    const totalPipeline = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const wonValue = opportunities
      .filter((o) => o.stage === 'Won')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    const highPriorityCount = opportunities.filter((o) => o.priority === 'High').length;
    return { totalPipeline, wonValue, highPriorityCount, count: total };
  }, [opportunities, total]);

  const openCreateModal = () => {
    setEditingOpportunity(null);
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingOpportunity(null);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (modalMode === 'edit' && editingOpportunity) {
        await updateOpportunity(editingOpportunity._id, payload);
      } else {
        await createOpportunity(payload);
      }
      closeModal();
      fetchOpportunities();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Failed to save opportunity'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOpportunity(deleteTarget._id);
      setDeleteTarget(null);
      fetchOpportunities();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete opportunity'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Opportunity pipeline</h1>
          <p className="dashboard-subtitle">Shared across your whole team — {total} total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + New opportunity
        </button>
      </div>

      <div className="summary-grid">
        <div className="surface-card summary-card">
          <p className="summary-label">Total pipeline value</p>
          <p className="summary-value">{formatCurrency(summary.totalPipeline)}</p>
        </div>
        <div className="surface-card summary-card">
          <p className="summary-label">Won value (this view)</p>
          <p className="summary-value">{formatCurrency(summary.wonValue)}</p>
        </div>
        <div className="surface-card summary-card">
          <p className="summary-label">High priority (this view)</p>
          <p className="summary-value">{summary.highPriorityCount}</p>
        </div>
        <div className="surface-card summary-card">
          <p className="summary-label">Opportunities</p>
          <p className="summary-value">{summary.count}</p>
        </div>
      </div>

      <div className="filters-bar">
        <input
          className="form-input search-input"
          placeholder="Search by customer, requirement, or contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split(':');
            setSortBy(field);
            setSortOrder(order);
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="estimatedValue:desc">Value: high to low</option>
          <option value="estimatedValue:asc">Value: low to high</option>
          <option value="nextFollowUpDate:asc">Follow-up: soonest</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="surface-card">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem' }}>📋</div>
            <p className="empty-state-title">No opportunities found</p>
            <p>
              {search || stageFilter || priorityFilter
                ? 'Try adjusting your filters.'
                : 'Create your first opportunity to get the pipeline started.'}
            </p>
          </div>
        ) : (
          <div className="opportunity-table-wrap">
            <table className="opportunity-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Requirement</th>
                  <th>Value</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Follow-up</th>
                  <th>Owner</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <OpportunityRow
                    key={opp._id}
                    opportunity={opp}
                    currentUserId={user?.id}
                    onEdit={openEditModal}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {modalMode && (
        <Modal
          title={modalMode === 'edit' ? 'Edit opportunity' : 'New opportunity'}
          onClose={closeModal}
        >
          {formError && <div className="alert alert-error">{formError}</div>}
          <OpportunityForm
            initialData={editingOpportunity}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            submitting={submitting}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete opportunity?" onClose={() => setDeleteTarget(null)}>
          <p>
            Are you sure you want to delete the opportunity for{' '}
            <strong>{deleteTarget.customerName}</strong>? This cannot be undone.
          </p>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button className="btn btn-danger-outline" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete opportunity'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
