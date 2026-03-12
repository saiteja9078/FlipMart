import { useEffect, useState } from 'react';
import { fetchBrands, fetchCategories } from '../../api/client';
import type { Category } from '../../types';
import './FilterSidebar.css';

interface Filters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  sort_by?: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price — Low to High' },
  { value: 'price_desc', label: 'Price — High to Low' },
  { value: 'rating', label: 'Popularity' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Discount' },
];

export default function FilterSidebar({ filters, onChange }: Props) {
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() || '');

  useEffect(() => {
    fetchBrands(filters.category_id).then(setBrands).catch(console.error);
  }, [filters.category_id]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const selectedBrands = filters.brand ? filters.brand.split(',') : [];

  const toggleBrand = (b: string) => {
    let next: string[];
    if (selectedBrands.includes(b.toLowerCase())) {
      next = selectedBrands.filter((x) => x !== b.toLowerCase());
    } else {
      next = [...selectedBrands, b.toLowerCase()];
    }
    onChange({ ...filters, brand: next.length ? next.join(',') : undefined });
  };

  const applyPrice = () => {
    onChange({
      ...filters,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const clearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    onChange({});
  };

  return (
    <aside className="filter-sidebar" id="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        <button className="filter-sidebar__clear" onClick={clearAll}>
          CLEAR ALL
        </button>
      </div>

      {/* Sort */}
      <div className="filter-sidebar__section">
        <h4>Sort By</h4>
        <select
          value={filters.sort_by || ''}
          onChange={(e) => onChange({ ...filters, sort_by: e.target.value || undefined })}
          className="filter-sidebar__select"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="filter-sidebar__section">
        <h4>Category</h4>
        <div className="filter-sidebar__list">
          <label className="filter-sidebar__check">
            <input
              type="radio"
              name="category"
              checked={!filters.category_id}
              onChange={() => onChange({ ...filters, category_id: undefined })}
            />
            <span>All</span>
          </label>
          {categories.map((cat) => (
            <label className="filter-sidebar__check" key={cat.id}>
              <input
                type="radio"
                name="category"
                checked={filters.category_id === cat.id}
                onChange={() => onChange({ ...filters, category_id: cat.id })}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-sidebar__section">
        <h4>Price Range</h4>
        <div className="filter-sidebar__price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            min={0}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            min={0}
          />
          <button className="filter-sidebar__go" onClick={applyPrice}>Go</button>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="filter-sidebar__section">
          <h4>Brand</h4>
          <div className="filter-sidebar__list filter-sidebar__list--scroll">
            {brands.map((b) => (
              <label className="filter-sidebar__check" key={b}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.toLowerCase())}
                  onChange={() => toggleBrand(b)}
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
