import "./Skeleton.css";

export const SkeletonLine = ({ width = "100%", height = "14px" }) => (
  <div className="skeleton-block" style={{ width, height }} />
);

export const SkeletonCard = () => (
  <div className="repo-card skeleton-card">
    <SkeletonLine width="40%" height="18px" />
    <SkeletonLine width="80%" />
    <SkeletonLine width="60%" />
  </div>
);

export const SkeletonList = ({ count = 3, Component = SkeletonCard }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Component key={i} />
    ))}
  </>
);

export default SkeletonCard;
