import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCategories } from '../../api/client';
import type { Category } from '../../types';
import './CategoryBar.css';

/* Simple emoji fallback icons for categories */
const CATEGORY_ICONS: Record<string, string> = {
  electronics: '📱',
  fashion: '👕',
  'home-furniture': '🛋️',
  books: '📚',
  sports: '⚽',
  'beauty-personal-care': '💄',
};

export default function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const handleClick = (categoryId: number) => {
    if (String(categoryId) === activeCategoryId) {
      navigate('/');
    } else {
      navigate(`/?category=${categoryId}`);
    }
  };

  if (!categories.length) return null;

  return (
    <div className="category-bar" id="category-bar">
      <div className="category-bar__inner container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-bar__item ${
              String(cat.id) === activeCategoryId
                ? 'category-bar__item--active'
                : ''
            }`}
            onClick={() => handleClick(cat.id)}
            id={`category-${cat.slug}`}
          >
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="category-bar__img"
                onError={(e) => {
                  // Replace broken image with emoji
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    const emoji = document.createElement('span');
                    emoji.className = 'category-bar__emoji';
                    emoji.textContent = CATEGORY_ICONS[cat.slug] || '📦';
                    target.replaceWith(emoji);
                  }
                }}
              />
            ) : (
              <span className="category-bar__emoji">
                {CATEGORY_ICONS[cat.slug] || '📦'}
              </span>
            )}
            <span className="category-bar__name">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
