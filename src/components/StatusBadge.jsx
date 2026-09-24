export default function StatusBadge({ isDuplicate }) {
  return <span className={`status-badge ${isDuplicate ? 'duplicate' : 'non-duplicate'}`}><span aria-hidden="true" className="status-dot" />{isDuplicate ? 'Duplicate' : 'Non-Duplicate'}</span>
}

