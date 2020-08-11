import React from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import axios from "axios";
import jwt from "jsonwebtoken";
import Layout from "./Layout";
import "../Styles/Forms.css";
import "../Styles/ActivateAccount.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class ActivateAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			token: "",
			name: "",
			buttonText: "Click Here to activate your account",
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

	submitForm = e => {
		e.preventDefault();

		this.setState({
			buttonText: `Activating Account...`,
		});

		trackPromise(
			axios
				.post(`/account-activation`, {
					token: this.state.token,
				})
				.then(res => {
					toast.success(res.data.message);
					this.props.history.push("/sign-in");
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Problem Connecting to Database`);
					}
					this.props.history.push("/sign-up");
				}),
			"activate-account"
		);
	};

	render() {
		return (
			<Layout>
				<div className="activate-account-container">
					<Spinner area="activate-account" />
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<div className="activate-account-message">
						Hey {this.state.name}!, Ready to activate your account?
					</div>
					<form className="form-body" onSubmit={this.submitForm}>
						<input
							className="submit-button activate-account-button"
							type="submit"
							value={this.state.buttonText}
						/>
					</form>
				</div>
			</Layout>
		);
	}
}

export default ActivateAccount;
