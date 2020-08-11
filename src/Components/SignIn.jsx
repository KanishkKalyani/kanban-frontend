import React from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axios from "axios";
import { authenticate, isAuth } from "../utils/helpers";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import "../Styles/Forms.css";
import "../Styles/SignIn.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class SignIn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: "",
			submitButton: "Login",
		};
	}

	handleChange = e => {
		this.setState({
			...this.state,
			[e.target.name]: e.target.value,
		});
	};

	submitForm = e => {
		e.preventDefault();
		const { email, password } = this.state;
		const { history } = this.props;

		if (password !== "") {
			this.setState({
				...this.state,
				submitButton: `Logging In...`,
			});

			trackPromise(
				axios
					.post(`/sign-in`, {
						email: email,
						password: password,
					})
					.then(res => {
						toast.success(res.data.message);
						authenticate(res, () => {
							this.setState({
								email: "",
								password: "",
								submitButton: "Login",
							});
							isAuth() ? history.push("/projects") : history.push("/sign-in");
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Problem Connecting to Database`);
						}

						this.setState({
							...this.state,
							submitButton: "Login",
						});
					}),
				"sign-in"
			);
		} else {
			if (password === "") {
				toast.warn(`Password cannot be blank`);
			}
		}
	};

	render() {
		const { email, password, submitButton } = this.state;
		return (
			<Layout>
				<div className="login-container">
					<Spinner area="sign-in" />
					<div className="form-header">Login</div>
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<form className="form-body" onSubmit={this.submitForm}>
						<input
							className="form-input"
							type="text"
							name="email"
							value={email}
							placeholder="Enter email..."
							onChange={this.handleChange}
						/>
						<input
							className="form-input"
							type="password"
							name="password"
							value={password}
							placeholder="Password..."
							onChange={this.handleChange}
						/>
						<input
							className="submit-button"
							type="submit"
							value={submitButton}
						/>
					</form>
					<Link className="forgot-password-link" to="/auth/password/forgot">
						Forgot Password
					</Link>
				</div>
			</Layout>
		);
	}
}

export default SignIn;
