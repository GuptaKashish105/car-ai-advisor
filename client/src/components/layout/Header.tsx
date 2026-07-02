import "./Header.css";

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <h1 className="app-header__title">Car AI Advisor</h1>
        <p className="app-header__tagline">Answer a few questions, get a shortlist you can actually trust.</p>
      </div>
    </header>
  );
}
