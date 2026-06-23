import { useState } from 'react';
import { STAGES, PRIORITIES, toDateInputValue } from '../utils';

const emptyForm = {
  customerName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  requirement: '',
  estimatedValue: '',
  stage: 'New',
  priority: 'Medium',
  nextFollowUpDate: '',
  notes: '',
};

const OpportunityForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(() =>
    initialData
      ? {
          customerName: initialData.customerName || '',
          contactName: initialData.contactName || '',
          contactEmail: initialData.contactEmail || '',
          contactPhone: initialData.contactPhone || '',
          requirement: initialData.requirement || '',
          estimatedValue: initialData.estimatedValue ?? '',
          stage: initialData.stage || 'New',
          priority: initialData.priority || 'Medium',
          nextFollowUpDate: toDateInputValue(initialData.nextFollowUpDate),
          notes: initialData.notes || '',
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Customer / company name is required';
    if (!form.requirement.trim()) newErrors.requirement = 'Requirement summary is required';
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Enter a valid email address';
    }
    if (form.estimatedValue !== '' && Number(form.estimatedValue) < 0) {
      newErrors.estimatedValue = 'Value cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      estimatedValue: form.estimatedValue === '' ? 0 : Number(form.estimatedValue),
      nextFollowUpDate: form.nextFollowUpDate || null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="customerName">
          Customer / company name
        </label>
        <input
          id="customerName"
          name="customerName"
          className={`form-input ${errors.customerName ? 'has-error' : ''}`}
          value={form.customerName}
          onChange={handleChange}
          placeholder="Acme Corp"
        />
        {errors.customerName && <div className="field-error">{errors.customerName}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="contactName">
            Contact person <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="contactName"
            name="contactName"
            className="form-input"
            value={form.contactName}
            onChange={handleChange}
            placeholder="Jane Doe"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="contactPhone">
            Contact phone <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            className="form-input"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contactEmail">
          Contact email <span className="optional-tag">(optional)</span>
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          className={`form-input ${errors.contactEmail ? 'has-error' : ''}`}
          value={form.contactEmail}
          onChange={handleChange}
          placeholder="jane@acme.com"
        />
        {errors.contactEmail && <div className="field-error">{errors.contactEmail}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="requirement">
          Requirement / need summary
        </label>
        <textarea
          id="requirement"
          name="requirement"
          className={`form-textarea ${errors.requirement ? 'has-error' : ''}`}
          value={form.requirement}
          onChange={handleChange}
          placeholder="Looking for a CRM integration with their billing system"
        />
        {errors.requirement && <div className="field-error">{errors.requirement}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="estimatedValue">
            Estimated deal value (₹) <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="estimatedValue"
            name="estimatedValue"
            type="number"
            min="0"
            className={`form-input ${errors.estimatedValue ? 'has-error' : ''}`}
            value={form.estimatedValue}
            onChange={handleChange}
            placeholder="50000"
          />
          {errors.estimatedValue && <div className="field-error">{errors.estimatedValue}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="nextFollowUpDate">
            Next follow-up date <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="nextFollowUpDate"
            name="nextFollowUpDate"
            type="date"
            className="form-input"
            value={form.nextFollowUpDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="stage">
            Stage
          </label>
          <select
            id="stage"
            name="stage"
            className="form-select"
            value={form.stage}
            onChange={handleChange}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="form-select"
            value={form.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="notes">
          Notes <span className="optional-tag">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          className="form-textarea"
          value={form.notes}
          onChange={handleChange}
          placeholder="Internal notes about this opportunity"
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initialData ? 'Save changes' : 'Create opportunity'}
        </button>
      </div>
    </form>
  );
};

export default OpportunityForm;
