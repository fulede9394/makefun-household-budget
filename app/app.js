(function () {
  'use strict';

  var KEY = 'homeledger-v1';
  var view = document.getElementById('view');
  var BUCKET_COLORS = { needs: '#1f6f4a', wants: '#e07856', savings: '#c96f2e' };

  function freshState() {
    return JSON.parse(JSON.stringify(SAMPLE_HOUSEHOLD));
  }

  function loadState() {
    var raw;
    try {
      raw = localStorage.getItem(KEY);
    } catch (err) {
      return freshState();
    }
    if (!raw) {
      return freshState();
    }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return freshState();
    }
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.expenses) || typeof parsed.income !== 'number') {
      return freshState();
    }
    if (Array.isArray(parsed.goals)) {
      parsed.goals.forEach(function (goal) {
        if (goal && typeof goal.saved === 'number' && typeof goal.target === 'number') {
          if (goal.saved > goal.target) {
            goal.saved = goal.target;
          }
          if (goal.saved < 0) {
            goal.saved = 0;
          }
        }
      });
    }
    return parsed;
  }

  function saveState() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      // Private browsing or a full store must not break the page.
    }
  }

  var state = loadState();

  function categoryOf(id) {
    var found = null;
    CATEGORIES.forEach(function (cat) {
      if (cat.id === id) {
        found = cat;
      }
    });
    return found || CATEGORIES[CATEGORIES.length - 1];
  }

  function money(amount) {
    return '$' + Math.round(Number(amount) || 0).toLocaleString('en-US');
  }

  function totalSpent() {
    var sum = 0;
    state.expenses.forEach(function (expense) {
      sum += Number(expense.amount) || 0;
    });
    return sum;
  }

  function bucketTotal(bucketId) {
    var sum = 0;
    state.expenses.forEach(function (expense) {
      if (categoryOf(expense.category).bucket === bucketId) {
        sum += Number(expense.amount) || 0;
      }
    });
    return sum;
  }

  function categoryTotals() {
    var rows = [];
    CATEGORIES.forEach(function (cat) {
      var value = 0;
      state.expenses.forEach(function (expense) {
        if (expense.category === cat.id) {
          value += Number(expense.amount) || 0;
        }
      });
      if (value > 0) {
        rows.push({ label: cat.label, color: cat.color, value: value });
      }
    });
    return rows;
  }

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000);
  }

  function moneyInput(value) {
    return '<input type="number" min="0" step="1" value="' + value + '" class="amount" aria-label="Amount in dollars">';
  }

  function shareOf(bucketId) {
    if (!state.income) {
      return 0;
    }
    return Math.round(bucketTotal(bucketId) / state.income * 100);
  }

  function goalPercent(goal) {
    if (!goal.target) {
      return 0;
    }
    return Math.round(goal.saved / goal.target * 100);
  }

  function goalCard(goal, noteText) {
    var pct = goalPercent(goal);
    var width = Math.min(100, pct);
    return '<div class="goal">' +
      '<div class="goal-head"><b>' + esc(goal.name) + '</b><span>' + money(goal.saved) + ' / ' + money(goal.target) + '</span></div>' +
      '<div class="bar"><div class="fill" style="width: ' + width + '%"></div></div>' +
      '<p class="goal-note">' + pct + '% funded · ' + noteText + '</p>' +
      '</div>';
  }

  function renderDashboard() {
    var spent = totalSpent();
    var left = state.income - spent;
    var rate = state.income === 0 ? 0 : Math.round(bucketTotal('savings') / state.income * 100);
    var rows = categoryTotals();
    var leftNote = left >= 0 ? 'Give it a job on the planner.' : 'Over budget — trim a want first.';

    var legend = rows.map(function (row) {
      return '<li><span class="dot" style="background: ' + esc(row.color) + '"></span>' + esc(row.label) + ' — <b>' + money(row.value) + '</b></li>';
    }).join('');

    var goalsHtml = state.goals.map(function (goal) {
      return goalCard(goal, esc(goal.note));
    }).join('');

    view.innerHTML =
      '<section class="hero"><h1>Your household budget, in balance.</h1>' +
      '<p class="lede">HomeLedger tracks one household\u2019s money: what comes in, where it goes, and what is left for the future. This is the sample household — change any number and it becomes yours.</p></section>' +
      '<div class="stats">' +
      '<div class="stat"><span class="stat-label">Monthly income</span><span class="stat-value">' + money(state.income) + '</span><span class="stat-note">' + esc(state.incomeNote) + '</span></div>' +
      '<div class="stat"><span class="stat-label">Planned spending</span><span class="stat-value">' + money(spent) + '</span><span class="stat-note">' + state.expenses.length + ' budget lines</span></div>' +
      '<div class="stat"><span class="stat-label">Left unassigned</span><span class="stat-value">' + money(left) + '</span><span class="stat-note">' + leftNote + '</span></div>' +
      '<div class="stat"><span class="stat-label">Savings rate</span><span class="stat-value">' + rate + '%</span><span class="stat-note">The 50/30/20 rule aims for 20%</span></div>' +
      '</div>' +
      '<section class="charts">' +
      '<div class="chartbox"><h2>Where the money goes</h2><canvas id="donut" height="280"></canvas><ul class="legend">' + legend + '</ul></div>' +
      '<div class="chartbox"><h2>Against the 50/30/20 rule</h2><canvas id="buckets" height="280"></canvas>' +
      '<p class="src">Bars show your actual share of income; the dark tick is the rule\u2019s target. <a href="#/tips">How the rule works</a></p></div>' +
      '</section>' +
      '<section><h2>Savings goals</h2><div class="goals">' + goalsHtml + '</div>' +
      '<p><a class="button" href="#/goals">Manage goals</a> <a class="button ghost" href="#/planner">Edit the budget</a></p></section>';

    drawDonut(document.getElementById('donut'), rows, [money(spent), 'per month']);
    var bars = BUCKETS.map(function (bucket) {
      return {
        label: bucket.label,
        actual: shareOf(bucket.id),
        target: bucket.target,
        color: BUCKET_COLORS[bucket.id] || '#1f6f4a'
      };
    });
    drawBucketBars(document.getElementById('buckets'), bars);
    window.__shotReady = true;
  }

  function renderPlanner() {
    var spent = totalSpent();
    var left = state.income - spent;

    var rowsHtml = state.expenses.map(function (expense) {
      var options = CATEGORIES.map(function (cat) {
        return '<option value="' + esc(cat.id) + '"' + (cat.id === expense.category ? ' selected' : '') + '>' + esc(cat.label) + '</option>';
      }).join('');
      return '<tr data-id="' + esc(expense.id) + '">' +
        '<td><input type="text" class="label-input" aria-label="Expense name" value="' + esc(expense.label) + '"></td>' +
        '<td><select class="cat-select" aria-label="Category">' + options + '</select></td>' +
        '<td class="num">' + moneyInput(expense.amount) + '</td>' +
        '<td><button class="danger" data-remove="' + esc(expense.id) + '">Remove</button></td>' +
        '</tr>';
    }).join('');

    var rulesHtml = BUCKETS.map(function (bucket) {
      return '<div class="rule"><b>' + esc(bucket.label) + ' — ' + shareOf(bucket.id) + '% </b>(target ' + bucket.target + '%)<p>' + esc(bucket.about) + '</p></div>';
    }).join('');

    view.innerHTML =
      '<h1>Budget planner</h1>' +
      '<p class="lede">Edit your income and every spending line. Totals update as you type, and everything is saved on this device.</p>' +
      '<div class="income-row"><label>Monthly take-home income ' + moneyInput(state.income) + '</label>' +
      '<span class="muted">dollars, after tax</span><span class="income-note">' + esc(state.incomeNote) + '</span></div>' +
      '<div class="tablewrap"><table><thead><tr><th>What</th><th>Category</th><th class="num">Amount / month</th><th></th></tr></thead>' +
      '<tbody id="expenseRows">' + rowsHtml + '</tbody></table></div>' +
      '<div class="planner-foot"><button id="addRow" class="button">+ Add a spending line</button>' +
      '<span class="totals">Planned: <b>' + money(spent) + '</b> · Left: <b>' + money(left) + '</b></span></div>' +
      '<section><h2>The 50/30/20 check</h2><div class="rulecheck">' + rulesHtml + '</div></section>' +
      '<p><button id="resetSample" class="ghost">Reset to the sample household</button></p>';

    var incomeInput = document.querySelector('.income-row input');
    if (incomeInput) {
      incomeInput.addEventListener('change', function () {
        state.income = Math.max(0, Math.round(Number(incomeInput.value) || 0));
        saveState();
        renderPlanner();
      });
    }

    document.querySelectorAll('#expenseRows tr').forEach(function (row) {
      var id = row.getAttribute('data-id');
      var expense = null;
      state.expenses.forEach(function (item) {
        if (item.id === id) {
          expense = item;
        }
      });
      if (!expense) {
        return;
      }
      var labelInput = row.querySelector('.label-input');
      if (labelInput) {
        labelInput.addEventListener('change', function () {
          expense.label = labelInput.value.trim() || 'Untitled';
          saveState();
        });
      }
      var catSelect = row.querySelector('.cat-select');
      if (catSelect) {
        catSelect.addEventListener('change', function () {
          expense.category = catSelect.value;
          saveState();
          renderPlanner();
        });
      }
      var amountInput = row.querySelector('.amount');
      if (amountInput) {
        amountInput.addEventListener('change', function () {
          expense.amount = Math.max(0, Math.round(Number(amountInput.value) || 0));
          saveState();
          renderPlanner();
        });
      }
      var removeButton = row.querySelector('[data-remove]');
      if (removeButton) {
        removeButton.addEventListener('click', function () {
          state.expenses = state.expenses.filter(function (item) {
            return item.id !== id;
          });
          saveState();
          renderPlanner();
        });
      }
    });

    var addButton = document.getElementById('addRow');
    if (addButton) {
      addButton.addEventListener('click', function () {
        state.expenses.push({ id: uid('exp'), category: 'other', label: 'New expense', amount: 0 });
        saveState();
        renderPlanner();
      });
    }

    var resetButton = document.getElementById('resetSample');
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        state = freshState();
        saveState();
        renderPlanner();
      });
    }

    window.__shotReady = true;
  }

  function renderGoals() {
    var cardsHtml = state.goals.map(function (goal) {
      var pct = goalPercent(goal);
      var width = Math.min(100, pct);
      var remaining = money(Math.max(0, goal.target - goal.saved));
      return '<div class="goal">' +
        '<div class="goal-head"><b>' + esc(goal.name) + '</b><span>' + money(goal.saved) + ' / ' + money(goal.target) + '</span></div>' +
        '<div class="bar"><div class="fill" style="width: ' + width + '%"></div></div>' +
        '<p class="goal-note">' + pct + '% funded · ' + remaining + ' to go · ' + esc(goal.note) + '</p>' +
        '<div class="goal-actions"><label>Add savings <input type="number" class="add-amount" data-goal="' + esc(goal.id) + '" placeholder="0" aria-label="Amount to add"></label>' +
        '<button class="button small" data-add="' + esc(goal.id) + '">Add to goal</button>' +
        '<button class="danger" data-del-goal="' + esc(goal.id) + '">Remove goal</button></div>' +
        '</div>';
    }).join('');

    view.innerHTML =
      '<h1>Savings goals</h1>' +
      '<p class="lede">A goal with a number and a date is a plan. Add a goal, set its target, and add to it whenever money is left over.</p>' +
      '<div class="goals">' + cardsHtml + '</div>' +
      '<section class="add-goal"><h2>Add a goal</h2>' +
      '<label>Goal name <input type="text" id="newGoalName" placeholder="e.g. New laptop"></label>' +
      '<label>Target ($) <input type="number" id="newGoalTarget" min="1" step="1" placeholder="1000"></label>' +
      '<button id="createGoal" class="button">Create goal</button></section>';

    document.querySelectorAll('[data-add]').forEach(function (button) {
      button.addEventListener('click', function () {
        var goalId = button.getAttribute('data-add');
        var input = document.querySelector('.add-amount[data-goal="' + goalId + '"]');
        var amount = input ? Math.max(0, Math.round(Number(input.value) || 0)) : 0;
        var goal = null;
        state.goals.forEach(function (item) {
          if (item.id === goalId) {
            goal = item;
          }
        });
        if (amount > 0 && goal) {
          goal.saved = Math.min(goal.target, goal.saved + amount);
          saveState();
          renderGoals();
        }
      });
    });

    document.querySelectorAll('[data-del-goal]').forEach(function (button) {
      button.addEventListener('click', function () {
        var goalId = button.getAttribute('data-del-goal');
        state.goals = state.goals.filter(function (item) {
          return item.id !== goalId;
        });
        saveState();
        renderGoals();
      });
    });

    var createButton = document.getElementById('createGoal');
    if (createButton) {
      createButton.addEventListener('click', function () {
        var nameInput = document.getElementById('newGoalName');
        var targetInput = document.getElementById('newGoalTarget');
        var name = nameInput ? nameInput.value.trim() : '';
        var target = targetInput ? Math.round(Number(targetInput.value) || 0) : 0;
        if (!name || target <= 0) {
          return;
        }
        state.goals.push({ id: uid('goal'), name: name, target: target, saved: 0, note: 'Added by you.' });
        saveState();
        renderGoals();
      });
    }

    window.__shotReady = true;
  }

  function renderTips() {
    var articles = TIPS.map(function (tip, index) {
      return '<article class="indicator"><h2>' + (index + 1) + '. ' + esc(tip.title) + '</h2><p>' + esc(tip.body) + '</p></article>';
    }).join('');

    view.innerHTML =
      '<h1>Budgeting, in plain language</h1>' +
      '<p class="lede">Six ideas that work for most households, most of the time. Nothing here is financial advice for your specific situation — it is a starting point.</p>' +
      articles +
      '<section><h2>The 50/30/20 rule, in one paragraph</h2>' +
      '<p>Split take-home pay into three buckets: about half for needs, about a third for wants, about a fifth for savings and extra debt payments. Check your own split on the <a href="#/">dashboard</a> — the bars show where you stand against each target, and the planner lets you move money between buckets until the shape looks right.</p></section>';

    window.__shotReady = true;
  }

  function route() {
    window.__shotReady = false;
    var hash = location.hash || '#/';
    var segment = hash.replace(/^#\/?/, '').split('/')[0];
    document.querySelectorAll('nav a').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#/' + segment);
    });
    if (segment === 'planner') {
      renderPlanner();
    } else if (segment === 'goals') {
      renderGoals();
    } else if (segment === 'tips') {
      renderTips();
    } else {
      renderDashboard();
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
