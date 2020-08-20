import React from "react";
import Layout from "./Layout";
import "../Styles/AppDetailsPage.css";

class AppDetailsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	redirect = () => {
		this.props.history.push("/");
	};

	render() {
		return (
			<Layout>
				<div className="app-details-page-container">
					<div className="app-features-container">
						<abbr title="Back To Home">
							<img
								src="https://img.icons8.com/fluent/80/000000/circled-left-2.png"
								className="back-button back-home-button"
								alt="Back To Home Button"
								onClick={this.redirect}
							/>
						</abbr>
						<div className="app-features-header">ALL FEATURES</div>
						<ul className="app-features-list">
							<li className="app-features-item">
								<div className="list-item-header">Signing Up</div>
								<div className="list-item-info">
									If you are a new user, to sign up with us, select the sign-up
									option from the top navigation bar. Enter your details in the
									sign up form and verify your e-mail id with the link being
									sent to you. There after, you can simply select the login
									option and enter your registered e-mail id and password to
									login and get started!
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Data Privacy</div>
								<div className="list-item-info">
									We maintain complete data privacy. All session requests are
									authenticated using encrypted tokens to make sure your data is
									safe and accessible only to authorized users.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">
									No Need to Login Every time
								</div>
								<div className="list-item-info">
									Once you login with Kanban Board, your session is valid for
									seven days. That means you don't need to login again and
									again, every time you use this website.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Multiple Projects</div>
								<div className="list-item-info">
									You can create multiple projects ans/or can also be part of
									multiple projects created by other users.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Managerial Access</div>
								<div className="list-item-info">
									You have managerial access for the projects created by you.
									Which means, managers can add other users of the application
									to the project by simply searching for them and can assign
									various features in the project to them. Only project manager
									can edit the project description and delete any feature or the
									entire project.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Employee Access</div>
								<div className="list-item-info">
									If a project manager has added you to their project, you can
									view the participants and the description of the project. You
									can also view the names of other participants and the features
									assigned to them. The name of the feature assigned to you is
									editable by you.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Features Access</div>
								<div className="list-item-info">
									The project may contain various features. While managers have
									access to view and edit any aspect of the project, the other
									participants of the projects can access the features assigned
									to them and customize their feature's data as they wish. Users
									can also customize the name of the feature assigned to them.
									Feature creation access is only allowed to the manager.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Stories</div>
								<div className="list-item-info">
									Each feature can have multiple stories. They may be created by
									project manager or by the user to whom that feature is
									assigned. Each Story's name is customizable and deletion of a
									story will automatically delete all of the tasks in it.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">
									Each Story's Own Kanban Board
								</div>
								<div className="list-item-info">
									Each Story has its own Kanban board with four columns and no
									tasks initially. The tasks can easily be added by the add task
									bar present above each board. All task and names are editable.
									All tasks can be dragged and dropped into any column, at any
									position.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Complete Editability</div>
								<div className="list-item-info">
									All projects, features, stories, columns, tasks have editable
									names.To save the edit changes, simply press enter after
									editing or press the save icon which will appear on making any
									changes. Note that the access to make edits will vary as
									mentioned in the managerial and employee access.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Clear Access Markings</div>
								<div className="list-item-info">
									The projects to which you have manager access will have a
									clear manager access mark. Similarly, if you are an added user
									to someone else's project, all the features assigned to you
									will have clear marking that access is granted to you for the
									respective project.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Status</div>
								<div className="list-item-info">
									Each Feature and Story has a dropdown menu to update its
									status. A story can be closed if and only if all the tasks in
									that story are in the last column. A feature can be closed if
									and only if all the stories of the feature have their
									respective status as closed.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Forgot Password</div>
								<div className="list-item-info">
									The app has a forgot password option on the Login page. In
									case you forgot your password, you can change it by getting
									the password reset link via e-mail to the e-mail id with which
									you are registered with us.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Easy Navigation</div>
								<div className="list-item-info">
									Each page has clear arrows to go to and from one page to
									another. Also, the navigation bar has direct option to go to
									the Home Page.
								</div>
							</li>
							<li className="app-features-item">
								<div className="list-item-header">Image Upload</div>
								<div className="list-item-info">
									User can view, update and delete their profile pictures.
									Clicking on profile picture will take user to the
									profile-picture page.
								</div>
							</li>
						</ul>
					</div>
				</div>
			</Layout>
		);
	}
}

export default AppDetailsPage;
