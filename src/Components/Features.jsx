import React from "react";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "../Styles/CommonFiles.css";
import "../Styles/Features.css";
import Layout from "./Layout";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";
import { isAuth } from "./../utils/helpers";

class Features extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newFeatName: "",
			features: [],
			backupFeat: {},
			backupIndex: undefined,
			employeeDetails: [],
		};
	}

	clicked = () => {
		const { backupIndex, backupFeat, features } = this.state;
		if (backupFeat.name !== undefined) {
			document
				.getElementById(backupFeat._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupFeat._id).classList.add("start-save-icon");
			features[backupIndex].name = backupFeat.name;
		}
		this.setState({ backupFeat: {}, backupIndex: undefined });
	};

	redirect = (featureId, featureName) => {
		const {
			projectId,
			projectName,
			employee,
			managerId,
		} = this.props.location.state;
		this.props.history.push({
			pathname: "/stories",
			state: {
				featureId: featureId,
				featureName: featureName,
				projectId: projectId,
				projectName: projectName,
				employee: employee,
				managerId: managerId,
			},
		});
	};

	backButton = () => {
		this.props.history.push({
			pathname: "/project-details",
			state: {
				projectId: this.props.location.state.projectId,
			},
		});
	};

	addFeature = event => {
		event.preventDefault();
		const { features, backupFeat, backupIndex } = this.state;
		if (backupFeat.name !== undefined) {
			document
				.getElementById(backupFeat._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupFeat._id).classList.add("start-save-icon");
			features[backupIndex].name = backupFeat.name;
		}
		this.setState({ backupFeat: {}, backupIndex: undefined });

		const name = this.state.newFeatName;
		const { projectId, managerId } = this.props.location.state;
		if (name !== "") {
			trackPromise(
				axios
					.post("/v1/features/add-feature", {
						projectId: projectId,
						name: name,
						managerId: managerId,
						employeeId: managerId,
						employeeName: isAuth().name,
					})
					.then(resp => {
						toast.success("Feature Created");
						const { features } = this.state;
						features.push(resp.data.feature);
						this.setState({ features: features, newFeatName: "" });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to add the feature`);
						}
					}),
				"add-feature"
			);
		} else {
			toast.error(`Feature name cannot be blank`);
		}
	};

	startEdit = index => {
		const { features, backupFeat, backupIndex } = this.state;
		let Feat = {};
		if (backupFeat.name !== undefined) {
			document
				.getElementById(backupFeat._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupFeat._id).classList.add("start-save-icon");
			features[backupIndex].name = backupFeat.name;
		}
		Feat = { ...features[index] };
		this.setState({ backupFeat: Feat, backupIndex: index });
	};

	handleEditChange = (event, index) => {
		let { features, backupFeat } = this.state;
		if (backupFeat.name === undefined) {
			let Feat = { ...features[index] };
			this.setState({ backupFeat: Feat, backupIndex: index });
		}
		let Feat = features[index];
		features[index].name = event.target.value;
		this.setState({ features: features });

		document.getElementById(Feat._id).classList.add("file-save-icon");
		document.getElementById(Feat._id).classList.remove("start-save-icon");
	};

	handleEditSave = index => {
		const projectId = this.props.location.state.projectId;

		let { features, backupFeat } = this.state;

		document
			.getElementById(features[index]._id)
			.classList.remove("file-save-icon");
		document
			.getElementById(features[index]._id)
			.classList.add("start-save-icon");
		if (
			backupFeat.name !== undefined &&
			features[index].name !== backupFeat.name
		) {
			trackPromise(
				axios
					.put("/v1/features/update-feature", {
						projectId: projectId,
						id: features[index]._id,
						name: features[index].name,
					})
					.then(() => {
						toast.success("Changed Successfully");
						this.setState({
							backupFeat: {},
							backupIndex: undefined,
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to update the feature name`);
						}
						features[index] = backupFeat;
						this.setState({
							features: features,
							backupFeat: {},
							backupIndex: undefined,
						});
					}),
				"update-feature"
			);
		} else {
			toast.info("No Changes Made");
		}
	};

	changeFeatureEmployee = (e, index) => {
		const id = e.target.options[e.target.value].id;

		const employeeName = e.target.options[e.target.value].innerHTML;

		let { features } = this.state;

		trackPromise(
			axios
				.put("/v1/features/update-feature-emp", {
					id: features[index]._id,
					employeeId: id,
					employeeName: employeeName,
				})
				.then(() => {
					toast.success("Changed Successfully");

					features[index].employeeId = id;
					features[index].employeeName = employeeName;

					this.setState({
						features,
					});
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to update the feature employee`);
					}
				}),
			"update-feature-employee"
		);
	};

	changeFeatureStatus = (e, index) => {
		let { features } = this.state;
		const status = e.target.options[e.target.value].innerHTML;

		trackPromise(
			axios
				.put("/v1/features/update-feature-status", {
					featureId: features[index]._id,
					status: status,
				})
				.then(resp => {
					if (resp.data.allow) {
						toast.success("Changed Status Successfully");

						features[index].status = status;

						this.setState({
							features,
						});
					} else {
						toast.error(
							`Feature can only be Closed if all Stories in this feature are Closed. There are still "${resp.data.count}" Non-Closed Stories in this feature`
						);
						var options = document.getElementById("feature-status-dropdown")
							.options;
						for (var i = 0; i < options.length; i++) {
							if (options[i].text === features[index].status) {
								options[i].selected = true;
								break;
							}
						}
					}
				})
				.catch(() => {
					toast.error(`Failed to update the feature status`);
					var options = document.getElementById("feature-status-dropdown")
						.options;
					for (var i = 0; i < options.length; i++) {
						if (options[i].text === features[index].status) {
							options[i].selected = true;
							break;
						}
					}
				}),
			"update-feature-status"
		);
	};

	deleteFeature = (event, id) => {
		const confirmation = window.confirm(
			`Deleting the Feature "${event.target.name}" will result in deletion of all Stories and Tasks in it!\nAre you sure?`
		);
		if (confirmation) {
			trackPromise(
				axios
					.delete(`/v1/features/delete-feature/${id}`)
					.then(resp => {
						toast.success(
							`Feature "${resp.data.deleted.name}" deleted successfully`
						);
						let { features } = this.state;

						const featureIndex = features.findIndex(feature => {
							return feature._id === id;
						});

						features.splice(featureIndex, 1);
						this.setState({ features, backupFeat: {}, backupIndex: undefined });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to delete the feature`);
						}
					}),
				"delete-feature"
			);
		}
	};

	componentDidMount() {
		const { projectId, employee } = this.props.location.state;

		const employeeDetails = [];
		Object.entries(employee).forEach(row => {
			employeeDetails.push(row[1]);
		});
		this.setState({ employeeDetails });

		trackPromise(
			axios
				.get(`/v1/features/all-features/${projectId}`)
				.then(resp => {
					this.setState({ features: resp.data.features });
				})
				.catch(err => {
					if (err) {
						toast.error(`Failed to load Features from Database, try again`);
					}
				}),
			"loading-features"
		);
	}

	render() {
		const { features, employeeDetails } = this.state;
		const { managerId } = this.props.location.state;
		return (
			<Layout>
				<Spinner area="loading-features" />
				<div
					onClick={() => {
						this.clicked();
					}}
					className="features-outer-container">
					<abbr title="Back to Project Details">
						<img
							src="https://img.icons8.com/fluent/80/000000/circled-left-2.png"
							className="back-button"
							alt="Back Button"
							onClick={this.backButton}
						/>
					</abbr>
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>

					<div className="show-project-name">
						Project: {this.props.location.state.projectName}
					</div>

					<div className="file-header">Features</div>
					{isAuth()._id === managerId && (
						<div className="add-file-wrapper">
							<input
								type="textarea"
								placeholder="Add Feature..."
								value={this.state.newFeatName}
								className="add-file"
								onKeyDown={e => {
									if (e.key === "Enter") {
										this.addFeature(e);
									}
								}}
								onChange={e => {
									this.setState({ newFeatName: e.target.value });
								}}
							/>
							<abbr title="Add Feature">
								<img
									src="https://img.icons8.com/ios/40/000000/plus.png"
									alt="Add Feature"
									className="add-file-button"
									onClick={this.addFeature}
								/>
							</abbr>
						</div>
					)}
					<div className="display-files">
						<div className="your-files">Your Features:</div>
						<Spinner area="add-feature" />
						<Spinner area="update-feature" />
						<Spinner area="update-feature-status" />
						<Spinner area="update-feature-employee" />
						<Spinner area="delete-feature" />
						{features.length === 0 && isAuth()._id === managerId && (
							<h2 className="no-files-currently">
								You have no Features for this project currently. Please create
								one.
							</h2>
						)}
						{features.length === 0 && isAuth()._id !== managerId && (
							<h2 className="no-files-currently">
								You have no Features for this project currently. Please wait
								till the Project Manager creates one.
							</h2>
						)}
						{features.length > 0 &&
							features.map((feature, index) => {
								const {
									_id,
									name,
									time,
									employeeId,
									employeeName,
									status,
								} = feature;
								return (
									<div
										key={_id}
										className="file-container"
										onClick={() => {
											if (
												isAuth()._id === employeeId ||
												isAuth()._id === managerId
											)
												this.redirect(_id, name);
										}}>
										<input
											type="text"
											value={name}
											placeholder="Feature Name..."
											className="file-name"
											onKeyDown={e => {
												if (e.key === "Enter") {
													if (
														isAuth()._id === employeeId ||
														isAuth()._id === managerId
													)
														this.handleEditSave(index);
												}
											}}
											onClick={e => {
												e.stopPropagation();
												if (
													isAuth()._id === employeeId ||
													isAuth()._id === managerId
												)
													this.startEdit(index);
											}}
											onChange={event => {
												if (
													isAuth()._id === employeeId ||
													isAuth()._id === managerId
												)
													this.handleEditChange(event, index);
											}}
										/>
										{/* ------------------------------------------------------------------------------- */}
										{isAuth()._id !== managerId &&
											isAuth()._id !== employeeId && (
												<div className="employee-name-tag">{employeeName}</div>
											)}
										{isAuth()._id === employeeId &&
											isAuth()._id !== managerId && (
												<div className="access-message">Access Granted</div>
											)}
										{isAuth()._id === managerId && (
											<select
												className="employee-dropdown-menu"
												onChange={e => {
													isAuth()._id === managerId &&
														this.changeFeatureEmployee(e, index);
												}}
												onClick={e => {
													e.stopPropagation();
												}}
												// Show initial value as the name of the employee whose Id is in employeeId
												name="feature-user-dropdown"
												id="feature-user-dropdown">
												{employeeDetails.map((user, index) => (
													<option
														id={user.id}
														className="employee-dropdown-item"
														value={index}
														key={user.id}
														selected={employeeId === user.id ? "selected" : ""}>
														{user.name}
													</option>
												))}
											</select>
										)}
										{/* ---------------------------------------------------------------------------- */}
										{(isAuth()._id === managerId ||
											isAuth()._id === employeeId) && (
											<select
												className="employee-dropdown-menu status-dropdown-menu"
												onChange={e => {
													if (
														isAuth()._id === managerId ||
														isAuth()._id === employeeId
													) {
														this.changeFeatureStatus(e, index);
													}
												}}
												onClick={e => {
													e.stopPropagation();
												}}
												name="feature-status-dropdown"
												id="feature-status-dropdown">
												<option
													className="employee-dropdown-item"
													value="0"
													key="New"
													selected={"New" === status ? "selected" : ""}>
													New
												</option>
												<option
													className="employee-dropdown-item"
													value="1"
													key="Active"
													selected={"Active" === status ? "selected" : ""}>
													Active
												</option>
												<option
													className="employee-dropdown-item"
													value="2"
													key="Closed"
													selected={"Closed" === status ? "selected" : ""}>
													Closed
												</option>
											</select>
										)}
										{/* ---------------------------------------------------------------------------- */}
										<div className="file-time">{time}</div>
										{isAuth()._id === managerId && (
											<abbr title="Delete">
												<img
													name={name}
													src="https://img.icons8.com/flat_round/20/000000/delete-sign.png"
													alt="delete logo"
													className="file-delete-icon"
													onClick={e => {
														e.stopPropagation();
														this.deleteFeature(e, _id);
													}}
												/>
											</abbr>
										)}
										<abbr title="Save Changes">
											<img
												src="https://img.icons8.com/color/25/000000/save-close.png"
												id={_id}
												alt="save logo"
												className="start-save-icon"
												onClick={e => {
													e.stopPropagation();
													this.handleEditSave(index);
												}}
											/>
										</abbr>
									</div>
								);
							})}
					</div>
				</div>
			</Layout>
		);
	}
}

export default Features;
