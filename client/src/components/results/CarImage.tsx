interface CarImageProps {
  make: string;
  model: string;
  imageUrl?: string;
}

/** Clean, minimal two-tone car silhouette — a soft filled shape plus a
 * crisp outline, deliberately simple so it reads well at small sizes. */
function CarSilhouetteIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="car-image__icon">
      <path
        d="M8 38c0-2.2.8-4.3 2.2-6l4.6-9.2A8 8 0 0 1 21.9 18h20.2a8 8 0 0 1 7.1 4.8L54 32c3.3 1 5.6 4 5.6 7.5V46a3 3 0 0 1-3 3h-2.4a5 5 0 0 1-9.9 0H19.7a5 5 0 0 1-9.9 0H8a3 3 0 0 1-3-3v-5c0-1.4.4-2.7 1.1-3.8Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M8 38c0-2.2.8-4.3 2.2-6l4.6-9.2A8 8 0 0 1 21.9 18h20.2a8 8 0 0 1 7.1 4.8L54 32c3.3 1 5.6 4 5.6 7.5V46a3 3 0 0 1-3 3h-2.4a5 5 0 0 1-9.9 0H19.7a5 5 0 0 1-9.9 0H8a3 3 0 0 1-3-3v-5c0-1.4.4-2.7 1.1-3.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 25h33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17.5" cy="46" r="4.5" fill="currentColor" />
      <circle cx="45.5" cy="46" r="4.5" fill="currentColor" />
    </svg>
  );
}

/**
 * The current dataset (server/src/data/cars.json) has no photos, so this
 * renders the placeholder today for every car. `imageUrl` exists so a future
 * data source can supply a real photo without any change to the consuming
 * card — the card never needs to know whether a real image exists.
 */
export function CarImage({ make, model, imageUrl }: CarImageProps) {
  const alt = `${make} ${model}`;

  if (imageUrl) {
    return <img className="car-image" src={imageUrl} alt={alt} />;
  }

  return (
    <div className="car-image car-image--placeholder" role="img" aria-label={alt}>
      <CarSilhouetteIcon />
    </div>
  );
}
