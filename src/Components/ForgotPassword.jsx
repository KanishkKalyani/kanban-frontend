import React from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axios from "axios";
import Layout from "./Layout";
import "../Styles/Forms.css";
import "../Styles/ForgotPassword.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class ForgotPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			submitButton: "Submit",
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
		const { email } = this.state;

		this.setState({
			...this.state,
			submitButton: `Submitting...`,
		});

		trackPromise(
			axios
				.post(`/forgot-password`, {
					email: email,
				})
				.then(res => {
					toast.success(res.data.message);
					this.setState({
						email: "",
						submitButton: "Submit",
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
						submitButton: "Submit",
					});
				}),
			"forgot-password"
		);
	};

	render() {
		const { email, submitButton } = this.state;
		return (
			<Layout>
				<div className="forgot-password-container">
					<Spinner area="forgot-password" />
					<div className="form-header">Forgot Password</div>
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

export default ForgotPassword;
