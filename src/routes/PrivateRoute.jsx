import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "../utils/helpers";

const PrivateRoute = ({ component: Component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={props =>
				isAuth() ? <Component {...props} /> : <Redirect to="/sign-in" />
			}
		/>
	);
};

export default PrivateRoute;
