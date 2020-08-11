import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signout } from "../utils/helpers";
import "../Styles/Layout.css";

const Layout = ({ children, history }) => {
	const nav = () => (
		<div className="layout-header-container">
			<div className="app-info">
				<img
					src={
						"../Kanban-logo.jpeg"
							? "../Kanban-logo.jpeg"
							: "https://www.pinclipart.com/picdir/big/37-375056_kanban-board-kanban-png-clipart.png"
					}
					alt="kanban-logo"
					className="kanban-logo-img"
				/>
				<div className="app-name">KANBAN BOARD</div>
			</div>
			<ul className="layout-list">
				<li>
					<Link className="layout-item" to="/">
						Home
					</Link>
				</li>
				{!isAuth() && (
					<>
						<li>
							<Link className="layout-item" to="/sign-in">
								Login
							</Link>
						</li>
						<li>
							<Link className="layout-item" to="/sign-up">
								Sign Up
							</Link>
						</li>
					</>
				)}

				{isAuth() && (
					<>
						<li>
							<span className="user-name">
								{JSON.parse(localStorage.getItem("user")).name}
							</span>
						</li>
						{/* <li>
							<Link className="layout-item" to="/projects">
								My Projects
							</Link>
						</li> */}

						<li>
							<span
								className="layout-item"
								onClick={() => {
									signout(() => {
										history.push("/");
									});
								}}>
								Logout
							</span>
						</li>
					</>
				)}
			</ul>
		</div>
	);

	return (
		<Fragment>
			{nav()}
			<div className="children-container">{children}</div>
		</Fragment>
	);
};

export default withRouter(Layout);
