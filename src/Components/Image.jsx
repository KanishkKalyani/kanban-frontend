import React from "react";
import axios from "axios";
import { isAuth } from "./../utils/helpers";

class Image extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			img: "",
		};
	}

	arrayBufferToBase64(buffer) {
		var binary = "";
		var bytes = [].slice.call(new Uint8Array(buffer));
		bytes.forEach(b => (binary += String.fromCharCode(b)));
		return window.btoa(binary);
	}

	componentDidMount() {
		axios
			.get(`/v1/files/profile-image/${isAuth()._id}`)
			.then(resp => {
				if (resp) {
					var base64Flag = "data:image/jpeg;base64,";
					var imageStr = this.arrayBufferToBase64(
						resp.data.image[0].img.data.data
					);
					this.setState({
						img: base64Flag + imageStr,
					});
				} else {
					this.setState({
						img: "",
					});
				}
			})
			.catch(err => {
				console.error(`ERROR in fetching profile picture`, err);
			});
	}

	render() {
		const { img } = this.state;
		let source =
			img === ""
				? "https://png.pngitem.com/pimgs/s/508-5087146_circle-hd-png-download.png"
				: img;
		return (
			<img src={source} className={this.props.className} alt="Profile Pic" />
		);
	}
}

export default Image;
