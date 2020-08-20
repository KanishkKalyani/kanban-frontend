import React, { Component } from "react";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { isAuth } from "./../utils/helpers";
import Layout from "./Layout";
import "../Styles/ProjectDetails.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class ProjectDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchResult: [],
			searchValue: "",
			description: "",
			employeeId: [],
			employee: [],
			project: {},
		};
	}

	redirect = () => {
		const { _id, name, managerId } = this.state.project;
		this.props.history.push({
			pathname: "/features",
			state: {
				projectId: _id,
				projectName: name,
				employee: this.state.employee,
				managerId: managerId,
			},
		});
	};

	backButton = () => {
		this.props.history.push("/projects");
	};

	search = str => {
		if (str !== "") {
			trackPromise(
				axios
					.get(`/v1/users/users-search/${str}`)
					.then(resp => {
						this.setState({ searchResult: resp.data.users });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to Add Project`);
						}
					}),
				"search"
			);
		} else {
			this.setState({ searchResult: [] });
		}
	};

	selectedUser = user => {
		const { projectId } = this.props.location.state;
		const newUser = { ...user, id: projectId };
		trackPromise(
			axios
				.put("/v1/projects/add-project-emp", {
					id: projectId,
					employeeId: user._id,
					employeeName: user.name,
				})
				.then(() => {
					toast.success(`Employee Added to the Project Successfully`);
					this.setState({
						searchResult: [],
						employeeId: [...this.state.employeeId, user._id],
						employee: [...this.state.employee, newUser],
						searchValue: "",
					});
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to Add Employee to the Project`);
					}
				}),
			"selected-user"
		);
	};

	deleteUser = (person, index) => {
		const { _id, managerId } = this.state.project;
		const { employee } = this.state;

		employee.splice(index, 1);

		if (managerId !== person[1].id) {
			trackPromise(
				axios
					.put("/v1/projects/remove-project-emp", {
						projectId: _id,
						userId: person[1].id,
						employee: employee,
					})
					.then(() => {
						toast.success(`Employee Removed From the Project Successfully`);
						const employeeId = [];
						Object.entries(employee).forEach(row => {
							employeeId.push(row[1].id);
						});
						this.setState({
							employee,
							employeeId,
							searchValue: "",
							searchResult: [],
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to Add Employee to the Project`);
						}
					}),
				"delete-user"
			);
		} else {
			toast.error("Cannot remove Manager from the project");
		}
	};

	saveDescription = e => {
		e.preventDefault();

		const { description } = this.state;

		trackPromise(
			axios
				.put("/v1/projects/update-project-desc", {
					id: this.props.location.state.projectId,
					description: description,
				})
				.then(() => {
					toast.success(`Description Updated Successfully`);
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to Add Project`);
					}
				}),
			"save-description"
		);
	};

	componentDidMount() {
		const { projectId } = this.props.location.state;

		trackPromise(
			axios
				.get(`/v1/projects/one-project/${projectId}`)
				.then(resp => {
					this.setState({ project: resp.data.project });

					const { employee, description } = this.state.project;
					const employeeId = [];
					Object.entries(employee).forEach(row => {
						employeeId.push(row[1].id);
					});
					this.setState({ employeeId, employee, description });
				})
				.catch(err => {
					if (err) {
						toast.error(`Failed to load Projects from Database, try again`);
					}
				}),
			"loading-project"
		);
	}

	render() {
		const {
			searchResult,
			searchValue,
			description,
			employeeId,
			employee,
			project,
		} = this.state;
		const { name, managerId } = project;
		return (
			<Layout>
				<div className="project-details-container">
					<Spinner area="search" />
					<Spinner area="selected-user" />
					<Spinner area="delete-user" />
					<Spinner area="save-description" />
					<Spinner area="loading-project" />

					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<abbr title="Back to All Projects">
						<img
							src="https://img.icons8.com/fluent/80/000000/circled-left-2.png"
							className="back-button"
							alt="Back Button"
							onClick={this.backButton}
						/>
					</abbr>

					<abbr title="To Features">
						<img
							src="https://img.icons8.com/fluent/100/000000/circled-right-2.png"
							className="to-features-button"
							alt="To Features Button"
							onClick={this.redirect}
						/>
					</abbr>
					<div className="project-name">{name} Details:</div>
					<div className="people-add-display-wrapper">
						{isAuth()._id === managerId && (
							<div className="type-ahead-dropdown-wrapper">
								<div className="add-people-header">
									Add Users to this Project:
								</div>
								<input
									type="text"
									className="type-ahead-search-bar"
									placeholder="Search employee by name..."
									value={searchValue}
									onChange={e => {
										this.search(e.target.value);
										this.setState({ searchValue: e.target.value });
									}}
								/>
								<ul className="type-ahead-dropdown-list">
									{searchResult.map(
										user =>
											!employeeId.includes(user._id) && (
												<li
													key={user._id}
													className="type-ahead-dropdown-item"
													onClick={() => this.selectedUser(user)}>
													{user.name}
												</li>
											)
									)}
								</ul>
							</div>
						)}

						<div className="project-employees-wrapper">
							<div className="project-employees-header">
								People on this Project:{" "}
							</div>
							<ul className="project-employees-list">
								{Object.entries(employee).map((person, index) => (
									<li className="project-employee-item" key={person[1]._id}>
										{person[1].name}
										{((isAuth()._id === managerId &&
											person[1].id !== managerId) ||
											(isAuth()._id === person[1].id &&
												person[1].id !== managerId)) && (
											<abbr title="Remove User from Project">
												<img
													src="https://img.icons8.com/flat_round/18/000000/minus.png"
													className="remove-employee-icon"
													alt="Delete Employee Icon"
													onClick={() => this.deleteUser(person, index)}
												/>
											</abbr>
										)}
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="description-wrapper">
						<form className="description-form" onSubmit={this.saveDescription}>
							<div className="project-description-label">
								Project Description:
							</div>
							<textarea
								className="description-textarea"
								value={description}
								onChange={e => {
									isAuth()._id === managerId &&
										this.setState({ description: e.target.value });
								}}
							/>
							{isAuth()._id === managerId && (
								<input
									type="submit"
									value="SAVE"
									className="description-save-button"
								/>
							)}
						</form>
					</div>
				</div>
			</Layout>
		);
	}
}

export default ProjectDetails;
