
import React, { Component } from 'react';
import Select from 'react-select'
import 'react-select/dist/react-select.css';

export default class MultiSelect extends Component {

	render() {

		return (
			<Select
				closeOnSelect={false}
				disabled={false}
				multi
				onChange={(value) => this.props.handleSelectChange(value)}
				options={this.props.options}
				removeSelected={true}
				simpleValue
				value={this.props.selected}
			/>
		)
	}
}