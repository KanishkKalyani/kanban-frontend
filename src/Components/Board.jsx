import React from "react";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "../Styles/Board.css";
import { trackPromise } from "react-promise-tracker";
import { Spinner } from "./Spinner";

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			columns: {
				0: {
					title: this.props.columns ? this.props.columns[0] : "Column 1",
					tasks: [],
				},
				1: {
					title: this.props.columns ? this.props.columns[1] : "Column 2",
					tasks: [],
				},
				2: {
					title: this.props.columns ? this.props.columns[2] : "Column 3",
					tasks: [],
				},
				3: {
					title: this.props.columns ? this.props.columns[3] : "Column 4",
					tasks: [],
				},
			},
			backupTask: {},
			backBackupTask: {},
			backupColumnName: "",
			backupColumnId: undefined,
			newTaskName: "",
		};
	}

	onDragEnd = result => {
		if (!result.destination) return;

		let { columns } = this.state;
		const backupColumns = columns;
		const { source, destination } = result;

		if (source.droppableId !== destination.droppableId) {
			const sourceCol = columns[source.droppableId];
			const destCol = columns[destination.droppableId];

			const sourceTasks = [...sourceCol.tasks];
			const destTasks = [...destCol.tasks];

			const [removed] = sourceTasks.splice(source.index, 1);
			destTasks.splice(destination.index, 0, removed);

			// Updating the column and index in all tasks
			sourceTasks.forEach((task, index) => {
				task.index = index;
				task.column = source.droppableId;
			});

			destTasks.forEach((task, index) => {
				task.index = index;
				task.column = destination.droppableId;
			});

			columns = {
				...columns,
				[source.droppableId]: {
					...sourceCol,
					tasks: sourceTasks,
				},
				[destination.droppableId]: {
					...destCol,
					tasks: destTasks,
				},
			};

			if (this.state.backupTask.name !== undefined) {
				this.clicked();
			}

			this.changeBothIndex(
				source.droppableId,
				Object.entries(columns)[source.droppableId][1].tasks,
				destination.droppableId,
				Object.entries(columns)[destination.droppableId][1].tasks,
				backupColumns
			);
		} else {
			const column = this.state.columns[source.droppableId];
			const copiedTasks = [...column.tasks];

			const [removed] = copiedTasks.splice(source.index, 1);
			copiedTasks.splice(destination.index, 0, removed);

			// Updating the index in all tasks
			copiedTasks.forEach((task, index) => {
				task.index = index;
			});

			columns = {
				...columns,
				[source.droppableId]: { ...column, tasks: copiedTasks },
			};

			if (this.state.backupTask.name !== undefined) {
				this.clicked();
			}

			// API Call to change index of tasks
			this.changeIndex(
				source.droppableId,
				Object.entries(columns)[source.droppableId][1].tasks,
				backupColumns
			);
		}
		this.setState({
			columns: columns,
			backupTask: {},
		});
	};

	changeBothIndex = (
		sourceColumnIndex,
		tasksOfSourceColumn,
		destinationColumnIndex,
		tasksOfDestinationColumn,
		backupColumns
	) => {
		axios
			.all(
				tasksOfSourceColumn.map((task, index) => {
					return axios.put("/v1/tasks/update-task", {
						id: task._id,
						name: task.name,
						column: sourceColumnIndex,
						index: index,
					});
				})
			)
			.then(() => {
				axios.all(
					tasksOfDestinationColumn.map((task, index) => {
						return axios.put("/v1/tasks/update-task", {
							id: task._id,
							name: task.name,
							column: destinationColumnIndex,
							index: index,
						});
					})
				);
			})
			.then(() => {})
			.catch(err => {
				if (err && err.response && err.response.data) {
					toast.error(err.response.data.error);
				} else {
					toast.error(`Failed to update changes`);
				}
				this.setState({
					columns: backupColumns,
					backupTask: {},
				});
			});
	};

	changeIndex = (columnIndex, tasksOfColumn, backupColumns) => {
		axios
			.all(
				tasksOfColumn.map((task, index) => {
					return axios.put("/v1/tasks/update-task", {
						id: task._id,
						name: task.name,
						column: columnIndex,
						index: index,
					});
				})
			)
			.then(() => {})
			.catch(err => {
				if (err && err.response && err.response.data) {
					toast.error(err.response.data.error);
				} else {
					toast.error(`Failed to update changes`);
				}
				this.setState({
					columns: backupColumns,
					backupTask: {},
				});
			});
	};

	addTask = () => {
		let name = this.state.newTaskName;

		const { columns } = this.state;
		const backupColumns = columns;
		const { storyId, projectId, featureId } = this.props;

		if (name !== "") {
			trackPromise(
				axios
					.post("/v1/tasks/add-task", {
						storyId: storyId,
						projectId: projectId,
						featureId: featureId,
						name: name,
					})
					.then(resp => {
						Object.entries(columns)[0][1].tasks.unshift(resp.data.task);
						Object.entries(columns)[0][1].tasks.forEach((task, index) => {
							task.index = index;
						});
						this.setState({
							columns: columns,
							backupTask: {},
							newTaskName: "",
						});

						this.changeIndex(
							0,
							Object.entries(columns)[0][1].tasks,
							backupColumns
						);
						toast.success(`New Task Added`);
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to add the task`);
						}
						this.setState({
							columns: backupColumns,
							backupTask: {},
							newTaskName: "",
						});
					}),
				"add-task"
			);
		} else {
			toast.error(`Task name cannot be blank`);
		}
	};

	clicked = () => {
		const {
			columns,
			backupTask,
			backupColumnName,
			backupColumnId,
		} = this.state;

		if (backupTask.name !== undefined) {
			Object.entries(columns)[backupTask.column][1].tasks[
				backupTask.index
			].name = backupTask.name;

			document
				.getElementById(backupTask._id)
				.classList.remove("task-save-icon");
			document.getElementById(backupTask._id).classList.add("hide-save-icon");

			this.setState({ backupTask: {} });
		}
		if (backupColumnName !== "") {
			Object.entries(columns)[backupColumnId][1].title = backupColumnName;
			this.setState({
				columns: columns,
				backupColumnId: undefined,
				backupColumnName: "",
			});

			document.getElementById(backupColumnId).classList.remove("column-save");
			document.getElementById(backupColumnId).classList.add("hide-save-icon");
		}
	};

	handleColumnChange = (event, columnId) => {
		let { columns, backupColumnName } = this.state;

		// Take backup in first iteration
		if (backupColumnName === "") {
			backupColumnName = Object.entries(columns)[columnId][1].title;
			this.setState({
				backupColumnName: backupColumnName,
				backupColumnId: columnId,
			});
			document.getElementById(columnId).classList.add("column-save");
			document.getElementById(columnId).classList.remove("hide-save-icon");
		}

		Object.entries(columns)[columnId][1].title = event.target.value;
		this.setState({ columns: columns });
	};

	editColumnSave = () => {
		if (
			this.state.columns[this.state.backupColumnId].title ===
			this.state.backupColumnName
		) {
			toast.info(`No changes to save`);
		} else if (this.state.columns[this.state.backupColumnId].title !== "") {
			let columns = [...this.props.columns];
			columns[this.state.backupColumnId] = this.state.columns[
				this.state.backupColumnId
			].title;

			this.props.editColumns(this.props.storyIndex, columns);
			this.setState({
				backupColumnId: undefined,
				backupColumnName: "",
			});
		} else {
			toast.error(`Column name cannot be blank`);
			//Revert back to original state
			const { columns, backupColumnId, backupColumnName } = this.state;
			Object.entries(columns)[backupColumnId][1].title = backupColumnName;
			this.setState({
				columns: columns,
				backupColumnId: undefined,
				backupColumnName: "",
			});
		}
		document
			.getElementById(this.state.backupColumnId)
			.classList.remove("column-save");
		document
			.getElementById(this.state.backupColumnId)
			.classList.add("hide-save-icon");
	};

	handleEditChange = (event, columnId, index) => {
		let { columns, backupTask } = this.state;

		// Take backup in first iteration
		if (backupTask.name === undefined) {
			let task = { ...Object.entries(columns)[columnId][1].tasks[index] };
			this.setState({ backupTask: task });
			document.getElementById(task._id).classList.add("task-save-icon");
			document.getElementById(task._id).classList.remove("hide-save-icon");
		}

		Object.entries(columns)[columnId][1].tasks[index].name = event.target.value;
		this.setState({ columns: columns });
	};

	saveEdit = (columnId, index) => {
		let { columns, backupTask } = this.state;
		const task = Object.entries(columns)[columnId][1].tasks[index];

		document.getElementById(task._id).classList.remove("task-save-icon");
		document.getElementById(task._id).classList.add("hide-save-icon");

		if (backupTask.name !== undefined && task.name !== backupTask.name) {
			trackPromise(
				axios
					.put("/v1/tasks/update-task", {
						id: task._id,
						name: task.name,
						column: columnId,
						index: index,
					})
					.then(() => {
						toast.success("Changed Successfully");
						this.setState({
							backupTask: {},
							backBackupTask: {},
						});
					})
					.catch(err => {
						if (err && err.response && err.response.data) {
							toast.error(err.response.data.error);
						} else {
							toast.error(`Failed to update the task`);
						}
						Object.entries(columns)[columnId][1].tasks[index] = backupTask;
						this.setState({
							columns: columns,
							backupTask: {},
							backBackupTask: {},
						});
					}),
				"update-task"
			);
		} else {
			toast.info("No Changes Made");
		}
	};

	deleteTask = (__, taskIndex, columnIndex, id) => {
		trackPromise(
			axios
				.delete(`/v1/tasks/delete-task/${id}`)
				.then(() => {
					let { columns } = this.state;

					Object.entries(columns)[columnIndex][1].tasks.splice(taskIndex, 1);
					Object.entries(columns)[columnIndex][1].tasks.forEach(
						(task, index) => {
							task.index = index;
						}
					);
					this.changeIndex(
						columnIndex,
						Object.entries(columns)[columnIndex][1].tasks,
						columns
					);
					this.setState({
						columns: columns,
						backupTask: {},
						backBackupTask: {},
					});
					toast.success(`Task Deleted`);
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to delete the task`);
					}
				}),
			"delete-task"
		);
	};

	componentDidMount = () => {
		let storyId = this.props.storyId;
		let columns = this.state.columns;
		trackPromise(
			axios
				.get(`/v1/tasks/all-tasks/${storyId}`)
				.then(resp => {
					resp.data.tasks.forEach(task => {
						if (task.column === 0) {
							Object.entries(columns)[0][1].tasks.splice(task.index, 0, task);
						} else if (task.column === 1) {
							Object.entries(columns)[1][1].tasks.splice(task.index, 0, task);
						} else if (task.column === 2) {
							Object.entries(columns)[2][1].tasks.splice(task.index, 0, task);
						} else if (task.column === 3) {
							Object.entries(columns)[3][1].tasks.splice(task.index, 0, task);
						}
					});
					this.setState({ columns });
				})
				.catch(err => {
					if (err && err.response && err.response.data) {
						toast.error(err.response.data.error);
					} else {
						toast.error(`Failed to load the tasks from database`);
					}
				}),
			"loading-tasks"
		);
	};

	render() {
		const { columns } = this.state;
		return (
			<div
				onClick={() => {
					this.clicked();
				}}>
				<Spinner area="loading-tasks" />
				<div className="add-task-wrapper">
					<input
						type="textarea"
						placeholder="Add Task..."
						value={this.state.newTaskName}
						className="add-task"
						onKeyDown={e => {
							if (e.key === "Enter") {
								this.addTask();
							}
						}}
						onChange={e => {
							this.setState({ newTaskName: e.target.value });
						}}
					/>
					<abbr title="Add Task">
						<img
							src="https://img.icons8.com/ios/35/000000/plus.png"
							alt="Add Task"
							className="add-task-button"
							onClick={this.addTask}
						/>
					</abbr>
				</div>
				<div className="all-tasks-container">
					<ToastContainer
						draggable={false}
						transition={Zoom}
						autoClose={2000}
					/>
					<DragDropContext onDragEnd={result => this.onDragEnd(result)}>
						{Object.entries(columns).map(([id, column]) => {
							return (
								<div className="column-wrapper" key={id}>
									<div className="column-title-wrapper">
										<input
											type="textarea"
											index={id}
											value={column.title}
											maxLength="19"
											className="column-title"
											onKeyDown={e => {
												if (e.key === "Enter") {
													this.editColumnSave(e);
												}
											}}
											onClick={() => this.clicked()}
											onChange={event => {
												this.handleColumnChange(event, id);
											}}
										/>
										<abbr title="Save Changes">
											<img
												src="https://img.icons8.com/color/25/000000/save-close.png"
												id={id}
												key={id}
												alt="save logo"
												className="hide-save-icon column-save"
												onClick={e => {
													e.stopPropagation();
													this.editColumnSave();
												}}
											/>
										</abbr>
									</div>
									<div className="column">
										{/* droppable are all Columns */}
										<Spinner area="add-task" />
										<Spinner area="delete-task" />
										<Spinner area="update-task" />
										<Droppable droppableId={id} key={id}>
											{(provided, snapshot) => {
												return (
													<div
														{...provided.droppableProps}
														ref={provided.innerRef}
														style={{
															background: snapshot.isDraggingOver
																? "lightblue"
																: "lightgray",
															padding: 6,
															width: 250,
															minHeight: 350,
															borderRadius: 8,
														}}>
														{column.tasks.map((task, index) => {
															return (
																// Draggable are all Tasks
																<Draggable
																	key={task._id}
																	draggableId={task._id}
																	index={index}>
																	{(provided, snapshot) => {
																		return (
																			<div
																				ref={provided.innerRef}
																				{...provided.draggableProps}
																				{...provided.dragHandleProps}
																				style={{
																					userSelect: "none",
																					position: "relative",
																					padding: "10px",
																					marginBottom: "8px",
																					borderRadius: 8,
																					height: "80px",
																					textTransform: "capitalize",
																					backgroundColor: snapshot.isDragging
																						? "#263b4a"
																						: "#456c86",
																					color: "white",
																					...provided.draggableProps.style,
																				}}>
																				<input
																					type="textarea"
																					value={task.name}
																					maxLength="19"
																					className="task-name"
																					onKeyDown={e => {
																						if (e.key === "Enter") {
																							this.saveEdit(
																								task.column,
																								task.index
																							);
																						}
																					}}
																					onClick={() => this.clicked()}
																					onChange={event => {
																						this.handleEditChange(
																							event,
																							task.column,
																							task.index
																						);
																					}}
																				/>
																				<div className="task-time">
																					{task.time}
																				</div>
																				<abbr title="Delete">
																					<img
																						key={task._id}
																						src="https://img.icons8.com/flat_round/20/000000/delete-sign.png"
																						alt="delete logo"
																						className="task-delete-icon"
																						onClick={event =>
																							this.deleteTask(
																								event,
																								task.index,
																								task.column,
																								task._id
																							)
																						}
																					/>
																				</abbr>
																				<abbr title="Save Changes">
																					<img
																						src="https://img.icons8.com/color/25/000000/save-close.png"
																						id={task._id}
																						key={task._id}
																						alt="save logo"
																						className="hide-save-icon"
																						onClick={e => {
																							e.stopPropagation();
																							this.saveEdit(
																								task.column,
																								task.index
																							);
																						}}
																					/>
																				</abbr>
																			</div>
																		);
																	}}
																</Draggable>
															);
														})}
														{provided.placeholder}
													</div>
												);
											}}
										</Droppable>
									</div>
								</div>
							);
						})}
					</DragDropContext>
				</div>
			</div>
		);
	}
}

export default Board;
