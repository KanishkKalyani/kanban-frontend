import React from "react";
import axios from "axios";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "../Styles/Stories.css";
import "../Styles/CommonFiles.css";
import Layout from "./Layout";
import Board from "./Board";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class Stories extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newStoName: "",
			stories: [],
			backupStory: {},
			backupIndex: undefined,
		};
	}

	backButton = () => {
		const {
			projectId,
			projectName,
			employee,
			managerId,
		} = this.props.location.state;
		this.props.history.push({
			pathname: "/features",
			state: {
				projectId: projectId,
				projectName: projectName,
				employee: employee,
				managerId: managerId,
			},
		});
	};

	clicked = () => {
		const { backupIndex, backupStory, stories } = this.state;
		if (backupStory.name !== undefined) {
			document
				.getElementById(backupStory._id)
				.classList.remove("story-save-icon");
			document.getElementById(backupStory._id).classList.add("start-save-icon");
			stories[backupIndex].name = backupStory.name;
		}
		this.setState({ backupStory: {}, backupIndex: undefined });
	};

	addStory = event => {
		event.preventDefault();
		const { stories, backupStory, backupIndex } = this.state;
		if (backupStory.name !== undefined) {
			document
				.getElementById(backupStory._id)
				.classList.remove("story-save-icon");
			document.getElementById(backupStory._id).classList.add("start-save-icon");
			stories[backupIndex].name = backupStory.name;
		}
		this.setState({ backupStory: {}, backupIndex: undefined });

		const name = this.state.newStoName;
		const { featureId, projectId } = this.props.location.state;
		if (name !== "") {
			trackPromise(
				axios
					.post("/v1/stories/add-story", {
						featureId: featureId,
						projectId: projectId,
						name: name,
					})
					.then(resp => {
						toast.success("Story Created");
						const { stories } = this.state;
						stories.push(resp.data.story);
						this.setState({ stories: stories, newStoName: "" });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to add the story`);
						}
					}),
				"add-story"
			);
		} else {
			toast.error(`Story name cannot be blank`);
		}
	};

	startEdit = index => {
		const { stories, backupStory, backupIndex } = this.state;
		let story = {};
		if (backupStory.name !== undefined) {
			document
				.getElementById(backupStory._id)
				.classList.remove("story-save-icon");
			document.getElementById(backupStory._id).classList.add("start-save-icon");
			stories[backupIndex].name = backupStory.name;
		}
		story = { ...stories[index] };
		this.setState({ backupStory: story, backupIndex: index });
	};

	handleEditChange = (event, index) => {
		let { stories, backupStory } = this.state;
		if (backupStory.name === undefined) {
			let story = { ...stories[index] };
			this.setState({ backupStory: story, backupIndex: index });
		}
		let story = stories[index];
		stories[index].name = event.target.value;
		this.setState({ stories: stories });

		document.getElementById(story._id).classList.add("story-save-icon");
		document.getElementById(story._id).classList.remove("start-save-icon");
	};

	handleEditSave = index => {
		const featureId = this.props.location.state.featureId;

		let { stories, backupStory } = this.state;

		document
			.getElementById(stories[index]._id)
			.classList.remove("story-save-icon");
		document
			.getElementById(stories[index]._id)
			.classList.add("start-save-icon");
		if (
			backupStory.name !== undefined &&
			stories[index].name !== backupStory.name
		) {
			trackPromise(
				axios
					.put("/v1/stories/update-story", {
						featureId: featureId,
						id: stories[index]._id,
						name: stories[index].name,
						columns: stories[index].columns,
					})
					.then(() => {
						toast.success("Changed Successfully");
						this.setState({
							backupStory: {},
							backupIndex: undefined,
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to update the story name`);
						}
						stories[index] = backupStory;
						this.setState({
							stories: stories,
							backupStory: {},
							backupIndex: undefined,
						});
					}),
				"update-story"
			);
		} else {
			toast.info("No Changes Made");
		}
	};

	editColumns = (index, columns) => {
		const featureId = this.props.location.state.featureId;

		let { stories } = this.state;
		trackPromise(
			axios
				.put("/v1/stories/update-story", {
					featureId: featureId,
					id: stories[index]._id,
					name: stories[index].name,
					columns: columns,
				})
				.then(() => {
					toast.success("Changed Successfully");
					stories[index].columns = columns;
					this.setState({ stories: stories });
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to update the story name`);
					}
				}),
			"update-columns"
		);
	};

	deleteStory = (event, id) => {
		const confirmation = window.confirm(
			`Deleting the Story "${event.target.name}" will result in deletion of all Tasks in it!\nAre you sure?`
		);
		if (confirmation) {
			trackPromise(
				axios
					.delete(`/v1/stories/delete-story/${id}`)
					.then(resp => {
						toast.success(
							`Story "${resp.data.deleted.name}" deleted successfully`
						);
						let { stories } = this.state;

						const storyIndex = stories.findIndex(story => {
							return story._id === id;
						});

						stories.splice(storyIndex, 1);
						this.setState({ stories, backupStory: {}, backupIndex: undefined });
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to delete the story`);
						}
					}),
				"delete-story"
			);
		}
	};

	changeStoryStatus = (e, index) => {
		let { stories } = this.state;
		const status = e.target.options[e.target.value].innerHTML;

		trackPromise(
			axios
				.put("/v1/stories/update-story-status", {
					storyId: stories[index]._id,
					status: status,
				})
				.then(resp => {
					if (resp.data.allow) {
						toast.success("Changed Status Successfully");

						stories[index].status = status;

						this.setState({
							stories,
						});
					} else {
						toast.error(
							`Story can only be Closed if all Tasks in this story are Closed. There are still "${resp.data.count}" Non-Closed Tasks in this story.`
						);
						var options = document.getElementById("story-status-dropdown")
							.options;
						for (var i = 0; i < options.length; i++) {
							if (options[i].text === stories[index].status) {
								options[i].selected = true;
								break;
							}
						}
					}
				})
				.catch(() => {
					toast.error(`Failed to update the story status`);
					var options = document.getElementById("story-status-dropdown")
						.options;
					for (var i = 0; i < options.length; i++) {
						if (options[i].text === stories[index].status) {
							options[i].selected = true;
							break;
						}
					}
				}),
			"update-story-status"
		);
	};

	componentDidMount() {
		const featureId = this.props.location.state.featureId;
		trackPromise(
			axios
				.get(`/v1/stories/all-stories/${featureId}`)
				.then(resp => {
					this.setState({ stories: resp.data.stories });
				})
				.catch(err => {
					if (err) {
						toast.error(`Failed to load Stories from Database, try again`);
					}
				}),
			"loading-stories"
		);
	}

	render() {
		const { stories } = this.state;
		const { featureId, projectId } = this.props.location.state;
		return (
			<Layout>
				<Spinner area="loading-stories" />
				<div
					onClick={() => {
						this.clicked();
					}}
					className="stories-outer-container">
					<abbr title="Back to Features">
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
					<div className="display-project-name">
						Project: {this.props.location.state.projectName}
					</div>
					<div className="display-feature-name">
						Feature: {this.props.location.state.featureName}
					</div>

					<div className="file-header">Stories</div>
					<div className="add-file-wrapper">
						<input
							type="textarea"
							placeholder="Add Story..."
							value={this.state.newStoName}
							className="add-file"
							onKeyDown={e => {
								if (e.key === "Enter") {
									this.addStory(e);
								}
							}}
							onChange={e => {
								this.setState({ newStoName: e.target.value });
							}}
						/>
						<abbr title="Add Story">
							<img
								src="https://img.icons8.com/ios/40/000000/plus.png"
								alt="Add Story"
								className="add-file-button"
								onClick={this.addStory}
							/>
						</abbr>
					</div>
					<div className="display-files">
						<div className="your-files">Your Stories:</div>
						<Spinner area="add-story" />
						<Spinner area="update-story" />
						<Spinner area="update-story-status" />
						<Spinner area="update-columns" />
						<Spinner area="delete-story" />
						{stories.length === 0 && (
							<h2 className="no-files-currently">
								You have no Stories for this Feature currently. Please create
								one.
							</h2>
						)}
						{stories.length > 0 &&
							stories.map((story, index) => {
								const { _id, name, time, status } = story;
								return (
									<div key={_id} className="story-container">
										<div className="story-name-container">
											<input
												type="textarea"
												value={name}
												maxLength="30"
												placeholder="Story Name..."
												className="story-name"
												onKeyDown={e => {
													if (e.key === "Enter") {
														this.handleEditSave(index);
													}
												}}
												onClick={e => {
													e.stopPropagation();
													this.startEdit(index);
												}}
												onChange={event => this.handleEditChange(event, index)}
											/>
											<select
												className="story-dropdown-menu"
												onChange={e => {
													this.changeStoryStatus(e, index);
												}}
												onClick={e => {
													e.stopPropagation();
												}}
												name="story-status-dropdown"
												id="story-status-dropdown">
												<option
													className="story-dropdown-item"
													value="0"
													key="New"
													selected={"New" === status ? "selected" : ""}>
													New
												</option>
												<option
													className="story-dropdown-item"
													value="1"
													key="Active"
													selected={"Active" === status ? "selected" : ""}>
													Active
												</option>
												<option
													className="story-dropdown-item"
													value="2"
													key="Closed"
													selected={"Closed" === status ? "selected" : ""}>
													Closed
												</option>
											</select>

											<div className="story-time">{time}</div>
										</div>

										<div className="story-board-container">
											<Board
												columns={story.columns}
												storyIndex={index}
												storyId={story._id}
												featureId={featureId}
												projectId={projectId}
												editColumns={this.editColumns}
												key={story._id}></Board>
										</div>

										<abbr title="Delete Story">
											<img
												name={name}
												src="https://img.icons8.com/flat_round/20/000000/delete-sign.png"
												alt="delete logo"
												className="story-delete-icon"
												onClick={e => {
													e.stopPropagation();
													this.deleteStory(e, _id);
												}}
											/>
										</abbr>
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

export default Stories;
