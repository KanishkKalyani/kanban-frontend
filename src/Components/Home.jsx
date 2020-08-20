import React, { Component } from "react";
import Layout from "./Layout";
import "../Styles/Home.css";
import { isAuth } from "./../utils/helpers";
import { Link } from "react-router-dom";

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	backButton = () => {
		this.props.history.push("/projects");
	};

	render() {
		return (
			<Layout>
				{isAuth() && (
					<abbr title="To Projects">
						<img
							src="https://img.icons8.com/fluent/90/000000/circled-right-2.png"
							className="to-projects-button"
							alt="Back Button"
							onClick={this.backButton}
						/>
					</abbr>
				)}
				<div className="home-container">
					<div className="home-header">
						Welcome to Kanban Board. Managing your projects has never been
						easier!
					</div>
					<div className="home-body">
						<div className="about-us-container">
							<div className="about-us-header">ABOUT US</div>
							<div className="about-us-body">
								Kanban Board is a complete solution to managing your projects
								along with your team and keep track of the progress made in the
								project by each member easily.
							</div>
						</div>
						<div className="images-container">
							<img
								className="example-images"
								src="./Homepage-img-1.png"
								alt="kanban-example-1"
							/>
							<img
								className="example-images"
								src="./Homepage-img-2.png"
								alt="kanban-example-2"
							/>
							<img
								className="example-images"
								src="./Homepage-img-3.png"
								alt="kanban-example-3"
							/>
							<img
								className="example-images"
								src="./Homepage-img-4.png"
								alt="kanban-example-4"
							/>
							<img
								className="example-images"
								src="./Homepage-img-5.png"
								alt="kanban-example-5"
							/>
							<img
								className="example-images"
								src="./Homepage-img-6.png"
								alt="kanban-example-6"
							/>
						</div>
						<div className="app-features-container">
							<div className="app-features-header">FEATURES</div>
							<ul className="app-features-list">
								<li className="app-features-item">
									<div className="list-item-header">Projects</div>
									<div className="list-item-info">
										Users can have multiple projects,either created by them or
										assigned to them by other user.
									</div>
								</li>
								<li className="app-features-item">
									<div className="list-item-header">Features</div>
									<div className="list-item-info">
										New Features can be added by project managers only.Features
										can be assigned to individual users who have been added to
										the project. Features also have status indicators indicating
										if they are new, active or complete. Feature can be edited
										by project manager or the user to whom the feature has been
										assigned.
									</div>
								</li>
								<li className="app-features-item">
									<div className="list-item-header">Stories</div>
									<div className="list-item-info">
										The user assigned to respective feature or the project
										manager have complete access to create update and delete
										stories as they want.
									</div>
								</li>
								<li className="app-features-item">
									<div className="list-item-header">Kanban board</div>
									<div className="list-item-info">
										Each story has its own Kanban board to which the user and
										the project manager have full access. Multiple tasks can be
										created and the all can be dragged and dropped into any
										column, at any index, as per the user preferences.
									</div>
								</li>
							</ul>
						</div>
						<div className="all-app-features-button-wrapper">
							<Link className="all-app-features-button" to="/app-details-page">
								ALL APP FEATURES IN DETAIL
							</Link>
						</div>
					</div>
				</div>
			</Layout>
		);
	}
}

export default Home;
