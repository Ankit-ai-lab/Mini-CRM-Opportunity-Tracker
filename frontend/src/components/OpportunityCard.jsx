import { stageBadgeClass, priorityBadgeClass, formatCurrency, formatDate } from '../utils';

const OpportunityRow = ({ opportunity, currentUserId, onEdit, onDelete }) => {
  const isOwner = opportunity.owner?._id === currentUserId || opportunity.owner === currentUserId;

  return (
    <tr className={isOwner ? 'is-own' : ''}>
      <td className="cell-customer">{opportunity.customerName}</td>
      <td className="cell-requirement" title={opportunity.requirement}>
        {opportunity.requirement}
      </td>
      <td className="cell-value">{formatCurrency(opportunity.estimatedValue)}</td>
      <td>
        <span className={`badge ${stageBadgeClass(opportunity.stage)}`}>{opportunity.stage}</span>
      </td>
      <td>
        <span className={`badge ${priorityBadgeClass(opportunity.priority)}`}>
          {opportunity.priority}
        </span>
      </td>
      <td>{formatDate(opportunity.nextFollowUpDate)}</td>
      <td>
        <span className={`owner-badge ${isOwner ? 'is-you' : ''}`}>
          {isOwner ? 'You' : opportunity.owner?.name || 'Unknown'}
        </span>
      </td>
      <td>{formatDate(opportunity.createdAt)}</td>
      <td>
        {/* Hiding these for non-owners is a UX nicety only —
            the backend independently re-checks ownership on PUT/DELETE. */}
        {isOwner && (
          <div className="row-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(opportunity)}>
              Edit
            </button>
            <button
              className="btn btn-danger-outline btn-sm"
              onClick={() => onDelete(opportunity)}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default OpportunityRow;
