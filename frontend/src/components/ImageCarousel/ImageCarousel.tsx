import { useState } from 'react';
import type { ProductImage } from '../../types';
import './ImageCarousel.css';

interface Props {
  images: ProductImage[];
  productName: string;
}

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><rect fill="#f5f5f5" width="500" height="500"/><text fill="#ccc" font-family="Arial" font-size="20" x="50%" y="50%" text-anchor="middle" dy="7">No Image</text></svg>'
);

export default function ImageCarousel({ images, productName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = FALLBACK_IMG;
  };

  if (!images.length) {
    return (
      <div className="carousel">
        <div className="carousel__main">
          <img src={FALLBACK_IMG} alt={productName} className="carousel__main-img" />
        </div>
      </div>
    );
  }

  return (
    <div className="carousel" id="image-carousel">
      {/* Thumbnails */}
      <div className="carousel__thumbs">
        {images.map((img, idx) => (
          <button
            key={img.id}
            className={`carousel__thumb ${
              idx === activeIdx ? 'carousel__thumb--active' : ''
            }`}
            onMouseEnter={() => setActiveIdx(idx)}
            onClick={() => setActiveIdx(idx)}
          >
            <img
              src={img.image_url}
              alt={`${productName} ${idx + 1}`}
              onError={handleImgError}
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="carousel__main">
        <img
          src={images[activeIdx].image_url}
          alt={productName}
          className="carousel__main-img"
          onError={handleImgError}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              className="carousel__arrow carousel__arrow--left"
              onClick={() =>
                setActiveIdx((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="carousel__arrow carousel__arrow--right"
              onClick={() =>
                setActiveIdx((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
