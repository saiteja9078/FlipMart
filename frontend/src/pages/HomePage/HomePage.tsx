import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../api/client';
import type { ProductBrief } from '../../types';
import CategoryBar from '../../components/CategoryBar/CategoryBar';
import ProductCard from '../../components/ProductCard/ProductCard';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import './HomePage.css';

interface Filters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  sort_by?: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || undefined;
  const categoryFromUrl = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : undefined;
  const page = Number(searchParams.get('page') || '1');

  // Sync category from URL to filters
  useEffect(() => {
    if (categoryFromUrl !== filters.category_id) {
      setFilters((prev) => ({ ...prev, category_id: categoryFromUrl }));
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      search,
      category_id: filters.category_id,
      min_price: filters.min_price,
      max_price: filters.max_price,
      brand: filters.brand,
      sort_by: filters.sort_by,
      page,
      limit: 20,
    })
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.total_pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filters, page]);

  const handleFilterChange = useCallback((f: Filters) => {
    setFilters(f);
    // Sync category to URL
    const params = new URLSearchParams(searchParams);
    if (f.category_id) {
      params.set('category', String(f.category_id));
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  return (
    <>
      <CategoryBar />

      <main className="home container" id="home-page">
        {/* Mobile filter toggle */}
        <button
          className="home__filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
          Filters
        </button>

        <div className="home__layout">
          {/* Filter Sidebar */}
          <div className={`home__sidebar ${showFilters ? 'home__sidebar--open' : ''}`}>
            <FilterSidebar filters={filters} onChange={handleFilterChange} />
          </div>

          {/* Products area */}
          <div className="home__content">
            {/* Active filter tags */}
            {(search || filters.brand || filters.min_price || filters.max_price) && (
              <div className="home__filters">
                {search && (
                  <span className="home__filter-tag">
                    Search: "{search}"
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.delete('search');
                        setSearchParams(p);
                      }}
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.brand && (
                  <span className="home__filter-tag">
                    Brand: {filters.brand}
                    <button onClick={() => handleFilterChange({ ...filters, brand: undefined })}>✕</button>
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="home__filter-tag">
                    Price: ₹{filters.min_price || 0} — ₹{filters.max_price || '∞'}
                    <button onClick={() => handleFilterChange({ ...filters, min_price: undefined, max_price: undefined })}>✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="home__loading">
                <div className="home__spinner" />
                <p>Loading products…</p>
              </div>
            ) : products.length === 0 ? (
              <div className="home__empty">
                <svg viewBox="0 0 64 64" width="80" height="80">
                  <path
                    fill="#ddd"
                    d="M32 2C15.4 2 2 15.4 2 32s13.4 30 30 30 30-13.4 30-30S48.6 2 32 2zm0 55C18 57 7 46 7 32S18 7 32 7s25 11 25 25-11 25-25 25zm-5-35h10v20H27V22zm0 25h10v5H27v-5z"
                  />
                </svg>
                <h2>No products found</h2>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="home__grid" id="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="home__pagination" id="pagination">
                    <button
                      className="home__page-btn"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      ← Previous
                    </button>
                    <span className="home__page-info">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="home__page-btn"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
