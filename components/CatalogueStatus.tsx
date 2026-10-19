type PaginationProps = {
  offset: number;
  limit: number;
  total: number;
  previous: () => void;
  next: () => void;
};
export function CataloguePagination({
  offset,
  limit,
  total,
  previous,
  next,
}: PaginationProps) {
  if (total <= limit) return null;
  return (
    <nav className="catalogue-pagination" aria-label="Destination pages">
      <button
        className="button secondary"
        onClick={previous}
        disabled={offset === 0}
      >
        Previous places
      </button>
      <span>
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </span>
      <button
        className="button secondary"
        onClick={next}
        disabled={offset + limit >= total}
      >
        Next places
      </button>
    </nav>
  );
}
export function CatalogueStatus({
  error,
  retry,
}: {
  error?: string;
  retry: () => void;
}) {
  return (
    <div className="catalogue-status" role={error ? "alert" : "status"}>
      <p>{error || "Finding your next discovery…"}</p>
      {error && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
