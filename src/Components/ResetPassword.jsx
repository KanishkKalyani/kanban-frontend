import React from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axios from "axios";
import jwt from "jsonwebtoken";
import Layout from "./Layout";
import "../Styles/Forms.css";
import "../Styles/ResetPassword.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class ResetPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			token: "",
			password: "",
			confirmPassword: "",
			submitButton: "Reset Password",
		};
	}

	componentDidMount() {
		const { match } = this.props;
		let token = match.params.token;

		if (token) {
			let { name } = jwt.decode(token);
			this.setState({
				token: token,
				name: name,
			});
		}
	}

	handleChange = e => {
		this.setState({
			...this.state,
			[e.target.name]: e.target.value,
		});
	};

	submitForm = e => {
		e.preventDefault();
		const { password, confirmPassword, token } = this.state;

		if (password !== "" && password === confirmPassword) {
			this.setState({
				...this.state,
				submitButton: `Resetting Password...`,
			});

			trackPromise(
				axios
					.post(`/reset-password`, {
						resetPasswordLink: token,
						newPassword: password,
					})
					.then(res => {
						toast.success(res.data.message);
						this.setState({
							password: "",
							confirmPassword: "",
							submitButton: `Reset Password`,
						});
						this.props.history.push("/sign-in");
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Problem Connecting to Database`);
						}

						this.setState({
							...this.state,
							submitButton: `Reset Password`,
						});
					}),
				"reset-password"
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
		const { password, confirmPassword, submitButton } = this.state;
		return (
			<Layout>
				<div className="reset-password-container">
					<Spinner area="reset-password" />
					<div className="form-header">Reset Password</div>
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<div className="reset-password-message">
						Hey {this.state.name}!, Reset your password here
					</div>
					<form className="form-body" onSubmit={this.submitForm}>
						<input
							className="form-input"
							type="password"
							name="password"
							value={password}
							placeholder="Password..."
							onChange={this.handleChange}
						/>
						<input
							className="form-input"
							type="password"
							name="confirmPassword"
							value={confirmPassword}
							placeholder="Confirm Password..."
							onChange={this.handleChange}
						/>
						<input
							className="submit-button forgot-password-submit-button"
							type="submit"
							value={submitButton}
						/>
					</form>
				</div>
			</Layout>
		);
	}
}

export default ResetPassword;
