$ = require('jquery')
toMarkdown = require('to-markdown')

const credentials = {
  token: '',
  url: ''
}

chrome.storage.sync.get({
  url: '',
  token: ''
}, function(items) {
  credentials.url = items.url + '/api/v4';
  credentials.token = items.token;
});

function getProjectId() {
  return $('[data-project-id]').data('project-id')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (window.location.href.indexOf(credentials.url) === -1) {
  console.log('Not a configured Gitlab instance. Exiting.')
  return;
}

setTimeout(function() {

  $('ul.board-list li').each(function(index, element) {

    const issueId = $(element).data('issue-id')

    const mrStates = {
      'opened': 'open',
      'closed': 'closed'
    }

    if (!issueId) {
      return
    }

    $.get({
      url: credentials.url + '/projects/' + getProjectId() + '/issues/' + issueId,
      beforeSend: function(xhr){ xhr.setRequestHeader('PRIVATE-TOKEN', credentials.token);}
    }).then(function(issue) {
      if (issue.weight !== null) {
        $(element).append($('<div style="text-align: right; color: #ccc; font-size: 0.8em; padding-top: 10px;">Weight: <b>' + issue.weight + '</b></div>'))
      }
    })
    $.get({
      url: credentials.url + '/projects/' + getProjectId() + '/issues/' + issueId + '/closed_by',
      beforeSend: function(xhr){ xhr.setRequestHeader('PRIVATE-TOKEN', credentials.token);}
    }).then(function(mergeRequests) {
      if (!mergeRequests.length) {
        return
      }

      $(element).append('<hr style="margin: 10px 0; border-top: 1px solid #f2f2f2;"/>')
      $(element).append('<ul class="merge-requests" style="font-size: 0.8em; list-style-type: none; margin: 0; padding: 0;" />')

      $.each(mergeRequests, function(index, mergeRequest) {

        let html = '<span class="merge-request-status ' + mrStates[mergeRequest.state] + '" style="font-size: 0.8em; margin-right: 3px;">' + mrStates[mergeRequest.state][0] + '</span>'
        html += '<a style="color: #ccc; cursor: pointer;" href="' + mergeRequest.web_url + '">' + mergeRequest.title + '</a>'

        const $li = $('<li/>').html(html)
        $(element).find('ul.merge-requests').append($li)
      })
    })
  })

}, 2000)

setTimeout(function() {
  $('.description div > .task-list').each(function(index, taskList) {
    $(taskList).css({ position: 'relative' })
    let $button = $('<button class="btn btn-sm" style="position: absolute; top: 0; right: 0;">Break apart</button>')
    const currentIssue = $('.issuable-meta .identifier a').text().replace(/#/, '')

    $button.on('click', function(e) {


      let promises = []

      $(taskList).find('.task-list-item').each(function(index, task) {
        let $task = $(task).clone()

        $task.first('input[type=checkbox]').remove()

        let title = $task.text().trim()
        let description = `Relates to #${currentIssue}\n\n`
        description += toMarkdown($task.html(), { gfm: true })
        description = description.replace(title, '')

        console.log($(task).html())
        console.log(description)

        // promises.push(sleep(index * 1000).then(function() {
        //   return $.post({
        //     url: credentials.url + '/projects/' + getProjectId() + '/issues',
        //     data: { title, description }
        //     dataType: 'json',
        //     beforeSend: function(xhr){ xhr.setRequestHeader('PRIVATE-TOKEN', credentials.token);},
        //   })
        // }))
      })

      // $.when.apply($, promises).done(function () {
      //   let issues = []
      //
      //   if (promises.length == 1) {
      //     issues.push(arguments[0])
      //   } else {
      //     $.each(arguments, function(index, responseData){
      //       issues.push(responseData)
      //     });
      //   }
      //
      //   $.get({
      //     url: credentials.url + '/projects/' + getProjectId() + '/issues/' + currentIssue,
      //     beforeSend: function(xhr){ xhr.setRequestHeader('PRIVATE-TOKEN', credentials.token);}
      //   }).then(function(oldIssue) {
      //     $.each(issues, function(index, newIssue) {
      //       if (newIssue.title) {
      //         oldIssue.description = oldIssue.description.replace(newIssue.title, `${newIssue.title} (#${newIssue.iid})`)
      //       }
      //     })
      //
      //     $.ajax({
      //       url: credentials.url + '/projects/' + getProjectId() + '/issues/' + currentIssue,
      //       beforeSend: function(xhr){ xhr.setRequestHeader('PRIVATE-TOKEN', credentials.token);},
      //       method: 'PUT',
      //       data: {
      //         description: oldIssue.description
      //       },
      //       dataType: 'json'
      //     }).then(function() {
      //       window.location.reload()
      //     })
      //   })
      // })
    })
    $(taskList).append($button)
  })
}, 1000)
