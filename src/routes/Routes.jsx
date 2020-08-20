import React, { Component } from "react";
import { BrowserRouter, Switch, Redirect } from "react-router-dom";
import Home from "./../Components/Home";
import SignUp from "./../Components/SignUp";
import SignIn from "./../Components/SignIn";
import ActivateAccount from "./../Components/ActivateAccount";
import ForgotPassword from "./../Components/ForgotPassword";
import Projects from "./../Components/Projects";
import ResetPassword from "./../Components/ResetPassword";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Stories from "./../Components/Stories";
import Features from "./../Components/Features";
import ProjectDetails from "./../Components/ProjectDetails";
import AppDetailsPage from "./../Components/AppDetailsPage";
import ImageUpload from "./../Components/ImageUpload";

class Routes extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return (
			<BrowserRouter>
				<Switch>
					<PublicRoute path="/" exact component={Home} />
					<PublicRoute
						path="/app-details-page"
						exact
						component={AppDetailsPage}
					/>
					<PublicRoute restricted path="/sign-up" exact component={SignUp} />
					<PublicRoute restricted path="/sign-in" exact component={SignIn} />
					<PublicRoute
						restricted
						path="/auth/activate/:token"
						exact
						component={ActivateAccount}
					/>
					<PublicRoute
						restricted
						path="/auth/password/forgot"
						exact
						component={ForgotPassword}
					/>
					<PublicRoute
						restricted
						path="/auth/password/reset/:token"
						exact
						component={ResetPassword}
					/>
					<PrivateRoute path="/projects" exact component={Projects} />
					<PrivateRoute path="/profile-image" exact component={ImageUpload} />
					<PrivateRoute
						path="/project-details"
						exact
						component={ProjectDetails}
					/>
					<PrivateRoute path="/features" exact component={Features} />
					<PrivateRoute path="/stories" exact component={Stories} />
					<Redirect to="/"></Redirect>
				</Switch>
			</BrowserRouter>
		);
	}
}

export default Routes;
