import "./poll.html";

Template.poll.events({
	'click input[name="addOption"]': function(e, t) {
		const nextOptClass = $("input[name='pollOption']").length + 1;

		const html = `<div class='input-group'>
						<input type='text' 
								class='form-control' 
								maxlength='40' 
								name='pollOption' 
								data-opt='${nextOptClass}' />
						<span class='input-group-btn'>
							<button class='${nextOptClass} btn' 
									name='colorPicker' 
									data-opt='${nextOptClass}'>BG Color</button>
						</span>
					</div>`;
		$("#pollInput").append(html);
		
		$("button[name='colorPicker']").colorpicker().on('changeColor', function(e) {
			e.preventDefault();

			this.style.backgroundColor = e.color.toHex();
		});
	}
});