let taskList = localStorage.getItem('taskList');
let html;
taskList = JSON.parse(taskList)
if (taskList === null) {
	taskList = [];
}


$(document).ready(function () {
	$('#datetimepicker').datetimepicker();
	createTaskItem()
	$('#title, #description').on('input', function () {
		$(this).removeClass('has-error');
	})

	$('#add-task').submit(function (e) {
		e.preventDefault();
		let error = 0;
		if ($('#title').val() === '') {
			$('#title').addClass('has-error')
			error++

		}
		if ($('#description').val() === '') {
			$('#description').addClass('has-error')
			error++
		}
		if ($('#datetimepicker').val() === '') {
			$('#datetimepicker').addClass('has-error')
			error++
		}
		if (error > 0) {
			alert('All fields must be filled!')
		} else {
			let id = taskList.length === 0 ? 1 : taskList[taskList.length - 1].id + 1;
			let title = $('#title').val();
			let description = $('#description').val();
			let time = new Date(encodeHTML($('#datetimepicker').val())).getTime();

			let task = {
				id: id,
				time: time,
				title: encodeHTML(title),
				description: encodeHTML(description),
			};
			taskList.push(task)
			updateLocalStorage();
			addTask(task);
			$("#add-task").trigger('reset');
		}
	});

	$('.task-list').on('click', '.js-close', function () {
		let id = $(this).parents('.item').data('id');
		$(this).parents('.item').remove();
		for (let index in taskList) {
			if (taskList[index].id === id) {
				taskList.splice(index, 1);
			}
		}
		updateLocalStorage();
	});

	$('.js-backup').on('click', function () {
		$.ajax({
			type: "POST",
			url: location.origin + '/backup',
			data: {data: JSON.stringify(taskList)},
			success: function (data) {
				if (data.result === 1) {
					alert('Success backup')
				} else {
					alert('Server Error')
				}
			}
		});
	})

});

function updateLocalStorage() {
	localStorage.setItem('taskList', JSON.stringify(taskList));
}

function addTask(task) {
	html = '';
	html += '<div class="item" data-id="' + task.id + '">'
	html += '<div class="close js-close">X</div>'
	html += ' <div class="item-content">'
	html += '<div class="title">' + task.title + '</div>'
	html += '<div class="date"><span>Date:</span> ' + timeConverter(task.time) + '</div>'
	html += '<div class="description">' + task.description + '</div>'
	html += ' </div></div>';
	$('.js-list').append(html);
}

function createTaskItem() {
	for (let task of taskList) {
		if (task !== null) {
			addTask(task)
		}
	}
}

function uuid() {
	let uuid = "", i, random;
	for (i = 0; i < 32; i++) {
		random = Math.random() * 16 | 0;
		if (i == 8 || i == 12 || i == 16 || i == 20) {
			uuid += "-"
		}
		uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	}
	return uuid;
}

function timeConverter(UNIX_timestamp) {
	var a = new Date(UNIX_timestamp);
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
	return time;
}


function encodeHTML(str) {
	return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, function (i) {
		return '&#' + i.charCodeAt(0) + ';';
	});
}

function decodeHTML(str) {
	return str.replace(/&#([0-9]{1,3});/gi, function (match, num) {
		return String.fromCharCode(parseInt(num));
	});
}
