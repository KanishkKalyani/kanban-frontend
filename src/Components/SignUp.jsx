import React from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axios from "axios";
import "../Styles/Forms.css";
import Layout from "./Layout";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class SignUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			submitButton: "Sign Up",
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
		const { name, email, password, confirmPassword } = this.state;

		if (password !== "" && password === confirmPassword) {
			this.setState({
				...this.state,
				submitButton: `Submitting...`,
			});

			trackPromise(
				axios
					.post(`/sign-up`, {
						name: name,
						email: email,
						password: password,
					})
					.then(res => {
						toast.success(res.data.message);
						this.setState({
							name: "",
							email: "",
							password: "",
							confirmPassword: "",
							submitButton: "Sign Up",
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
							submitButton: "Sign Up",
						});
					}),
				"sign-up"
			);
		} else {
			if (password === "") {
				toast.warn(`Password cannot be blank`);
			} else {
				toast.error(
					`Password and Confirmed password are not same, Please Retry`
				);
			}
		}
	};

	render() {
		const { name, email, password, confirmPassword, submitButton } = this.state;
		return (
			<Layout>
				<div className="form-container">
					<Spinner area="sign-up" />
					<div className="form-header">Sign Up</div>
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<form className="form-body" onSubmit={this.submitForm}>
						<input
							type="text"
							className="form-input"
							name="name"
							value={name}
							placeholder="Enter name..."
							onChange={this.handleChange}
						/>
						<input
							type="text"
							className="form-input"
							name="email"
							value={email}
							placeholder="Enter email..."
							onChange={this.handleChange}
						/>
						<input
							type="password"
							className="form-input"
							name="password"
							placeholder="Password..."
							value={password}
							onChange={this.handleChange}
						/>
						<input
							type="password"
							className="form-input"
							name="confirmPassword"
							value={confirmPassword}
							placeholder="Confirm Password..."
							onChange={this.handleChange}
						/>
						<input
							className="submit-button"
							type="submit"
							value={submitButton}
						/>
					</form>
				</div>
			</Layout>
		);
	}
}

export default SignUp;
