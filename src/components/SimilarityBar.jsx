export default function SimilarityBar({ score, tone }) {
  const percentage = (score * 100).toFixed(1)
  return <div className="similarity-bar" data-tone={tone} role="progressbar" aria-label="Similarity score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(percentage)} aria-valuetext={`${percentage}%`}><div style={{ width: `${percentage}%` }} /></div>
}

