import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page full-center">
      <div className="center">
        <h1>Page not found</h1>
        <p>That chart doesn't exist.</p>
        <Link className="btn btn-primary" to="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
