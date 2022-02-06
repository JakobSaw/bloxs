import { Link } from "react-router-dom";
const NotFound = () => {
    return (
        <div className="not_found_container">
            <h1>Nothing was found!</h1>
            <Link to="/">Back Home</Link>
        </div>
    );
};

export default NotFound;
