import React from "react";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";
import "../Styles/CommonFiles.css";
import Layout from "./Layout";
import { isAuth } from "./../utils/helpers";

class Projects extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newProjName: "",
			projects: [],
			backupProj: {},
			backupIndex: undefined,
		};
	}

	clicked = () => {
		const { backupIndex, backupProj, projects } = this.state;
		if (backupProj.name !== undefined) {
			document
				.getElementById(backupProj._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupProj._id).classList.add("start-save-icon");
			projects[backupIndex].name = backupProj.name;
		}
		this.setState({ backupProj: {}, backupIndex: undefined });
	};

	redirect = project => {
		const { _id } = project;
		this.props.history.push({
			pathname: "/project-details",
			state: {
				projectId: _id,
			},
		});
	};

	addProject = event => {
		event.preventDefault();
		const { projects, backupProj, backupIndex } = this.state;
		if (backupProj.name !== undefined) {
			document
				.getElementById(backupProj._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupProj._id).classList.add("start-save-icon");
			projects[backupIndex].name = backupProj.name;
		}
		this.setState({ backupProj: {}, backupIndex: undefined });

		const name = this.state.newProjName;
		const userId = isAuth()._id;
		const userName = isAuth().name;
		if (name !== "") {
			trackPromise(
				axios
					.post("/v1/projects/add-project", {
						userId: userId,
						name: name,
						userName: userName,
					})
					.then(resp => {
						toast.success("Project Created");
						const { projects } = this.state;
						projects.push(resp.data.project);
						this.setState({ projects: projects, newProjName: "" });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to Add Project`);
						}
					}),
				"add-project"
			);
		} else {
			toast.error(`Project name cannot be blank`);
		}
	};

	startEdit = index => {
		const { projects, backupProj, backupIndex } = this.state;
		let proj = {};
		if (backupProj.name !== undefined) {
			document
				.getElementById(backupProj._id)
				.classList.remove("file-save-icon");
			document.getElementById(backupProj._id).classList.add("start-save-icon");
			projects[backupIndex].name = backupProj.name;
		}
		proj = { ...projects[index] };
		this.setState({ backupProj: proj, backupIndex: index });
	};

	handleEditChange = (event, index) => {
		let { projects, backupProj } = this.state;
		if (backupProj.name === undefined) {
			let proj = { ...projects[index] };
			this.setState({ backupProj: proj, backupIndex: index });
		}
		let proj = projects[index];
		projects[index].name = event.target.value;
		this.setState({ projects: projects });

		document.getElementById(proj._id).classList.add("file-save-icon");
		document.getElementById(proj._id).classList.remove("start-save-icon");
	};

	handleEditSave = index => {
		const userId = JSON.parse(localStorage.getItem("user"))._id;

		let { projects, backupProj } = this.state;

		document
			.getElementById(projects[index]._id)
			.classList.remove("file-save-icon");
		document
			.getElementById(projects[index]._id)
			.classList.add("start-save-icon");
		if (
			backupProj.name !== undefined &&
			projects[index].name !== backupProj.name
		) {
			trackPromise(
				axios
					.put("/v1/projects/update-project-name", {
						userId: userId,
						id: projects[index]._id,
						name: projects[index].name,
					})
					.then(() => {
						toast.success("Changed Successfully");
						this.setState({
							backupProj: {},
							backupIndex: undefined,
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to edit the project name`);
						}
						projects[index] = backupProj;
						this.setState({
							projects: projects,
							backupProj: {},
							backupIndex: undefined,
						});
					}),
				"update-project"
			);
		} else {
			toast.info("No Changes Made");
		}
	};

	deleteProject = async (event, id) => {
		const confirmation = window.confirm(
			`Deleting the Project "${event.target.name}" will result in deletion of all Features, Stories and Tasks in it!\nAre you sure?`
		);
		if (confirmation) {
			trackPromise(
				axios
					.delete(`/v1/projects/delete-project/${id}`)
					.then(resp => {
						toast.success(
							`Project "${resp.data.deleted.name}" deleted successfully`
						);
						let { projects } = this.state;

						const projectIndex = projects.findIndex(project => {
							return project._id === id;
						});

						projects.splice(projectIndex, 1);
						this.setState({ projects, backupProj: {}, backupIndex: undefined });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to delete the project`);
						}
					}),
				"delete-project"
			);
		}
	};

	componentDidMount() {
		const userId = isAuth()._id;

		trackPromise(
			axios
				.get(`/v1/projects/all-projects/${userId}`)
				.then(resp => {
					this.setState({ projects: resp.data.projects });
				})
				.catch(err => {
					if (err) {
						toast.error(`Failed to load Projects from Database, try again`);
					}
				}),
			"loading-projects"
		);
	}

	render() {
		const { projects } = this.state;
		return (
			<Layout>
				<div
					onClick={() => {
						this.clicked();
					}}
					className="files-outer-container">
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<Spinner area="loading-projects" />
					<div className="file-header">Projects</div>
					<div className="add-file-wrapper">
						<input
							type="textarea"
							placeholder="Add Project..."
							value={this.state.newProjName}
							className="add-file"
							onKeyDown={e => {
								if (e.key === "Enter") {
									this.addProject(e);
								}
							}}
							onChange={e => {
								this.setState({ newProjName: e.target.value });
							}}
						/>
						<abbr title="Add Project">
							<img
								src="https://img.icons8.com/ios/40/000000/plus.png"
								alt="Add Project"
								className="add-file-button"
								onClick={this.addProject}
							/>
						</abbr>
					</div>
					<div className="display-files">
						<Spinner area="add-project" />
						<Spinner area="update-project" />
						<Spinner area="delete-project" />
						<div className="your-files">Your Projects:</div>
						{projects.length === 0 && (
							<h2 className="no-files-currently">
								You have no Projects for this project currently. Please create
								one.
							</h2>
						)}
						{projects.length > 0 &&
							projects.map((project, index) => {
								const { _id, name, time, managerId } = project;
								return (
									<div
										key={_id}
										className="file-container"
										onClick={() => {
											this.redirect(project);
										}}>
										<input
											type="text"
											value={name}
											placeholder="Project Name..."
											className="file-name"
											onKeyDown={e => {
												if (e.key === "Enter") {
													isAuth()._id === managerId &&
														this.handleEditSave(index);
												}
											}}
											onClick={e => {
												e.stopPropagation();
												isAuth()._id === managerId && this.startEdit(index);
											}}
											onChange={event =>
												isAuth()._id === managerId &&
												this.handleEditChange(event, index)
											}
										/>
										{isAuth()._id === managerId && (
											<div className="access-message">Manager Access</div>
										)}
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
														this.deleteProject(e, _id);
													}}
												/>
											</abbr>
										)}{" "}
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

export default Projects;
