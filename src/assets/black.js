frappe.ui.form.on('Admin Table', {
		"qty": function(frm, cdt, cdn) {
		let gridRow = frm.open_grid_row();
		if (!gridRow) {
			gridRow = frm.get_field('table').grid.get_row(cdn);
		}
		getAmount(gridRow);
	},
	
	"rate": function(frm, cdt, cdn) {
		let gridRow = frm.open_grid_row();
		if (!gridRow) {
			gridRow = frm.get_field('table').grid.get_row(cdn);
		}
		getAmount(gridRow);
	},
	
	amount: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.table.forEach(function (d) { total += d.amount; });
        frm.set_value("total", total);
        refresh_field("total");
    },
    
    table_remove: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.table.forEach(function (d) { total += d.amount; });
        frm.set_value("total", total);
        refresh_field("total");
    },
    
})
//copied from mssl


function validateInstallments(frm, fieldNames) {
  return (
    !frm.doc[fieldNames.isPaidField] && (frm.doc[fieldNames.field]) >
    frm.doc.balance
  );
}

const payments = [
  { field: "first_payment", isPaidField: "paid_1" },
  { field: "second_payment", isPaidField: "paid_2" },
  { field: "third_payment", isPaidField: "paid_3" },
];


function sumPayments(frm) {
  frm.set_value(
    "total_paid",
    flt((frm.doc.paid_1 && frm.doc.first_payment) || 0) +
      flt((frm.doc.paid_2 && frm.doc.second_payment) || 0) +
      flt((frm.doc.paid_3 && frm.doc.third_payment) || 0)
  );

  getBalance(frm);
  
  //frm.save();

}

function getBalance(frm) {
  frm.set_value(
    "balance",
    flt(frm.doc.total || 0) - flt(frm.doc.total_paid || 0)
  );
}

frappe.ui.form.on("Administrative Memo", {
  refresh: function (frm) {
    sumPayments(frm);
  },
  before_save: function (frm) {
    payments.forEach((payment) => {
      if (validateInstallments(frm, payment)) {
        return frappe.throw(
          `${
            payment.field.split("_")[0]
          } Installment cannot be more than Balance!`
        );
      }
    });
  },
});

function getNextInstallment(paid_1, paid_2, paid_3) {
  if (paid_1 === 0) {
    return { index: 1, fieldname: "first_payment" };
  }

  if (paid_1 == 1 && paid_2 == 1) {
    return { index: 3, fieldname: "third_payment" };
  }

  if (paid_1 == 1 && paid_2 === 0) {
    return { index: 2, fieldname: "second_payment" };
  }

  if (paid_1 == 1 && paid_2 == 1 && paid_3 == 1) {
    return -1;
  }
}

function createJournalEntry(installment, frm) {
  let data = {};

  switch (installment) {
    case 1:
      data = [
        {
        'account': frm.doc.debit,
        'debit_in_account_currency': frm.doc.first_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark,
        },
        {
        'account': frm.doc.credit,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.first_payment,
        'user_remark': frm.doc.user_remark,
        },
      ];
      break;
    case 2:
      data = [
        {
        'account': frm.doc.debit_2,
        'debit_in_account_currency': frm.doc.second_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark_2,
        },
        {
        'account': frm.doc.credit_2,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.second_payment,
        'user_remark': frm.doc.user_remark_2,
        },
      ];
      break;
    case 3:
      data = [
        {
        'account': frm.doc.debit_3,
        'debit_in_account_currency': frm.doc.third_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark_3,
        },
        {
        'account': frm.doc.credit_3,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.third_payment,
        'user_remark': frm.doc.user_remark_3,
        },
      ];
      break;
  }
  return frappe.db.insert({
    doctype: "Journal Entry",
    docstatus: 0, // submit doc
    entry_type: "Journal Entry",
    documents: "Administrative Memo",
    document_id: frm.doc.name,
    user_remark: `AGENT: ${data[0].user_remark}`,
    posting_date: frappe.datetime.nowdate(),
    accounts: data,
  });
}


frappe.ui.form.on("Administrative Memo", {
     before_workflow_action: async function (frm) {
    console.log(
      "action => ",
      frm.selected_workflow_action,
      "State => ",
      frm.doc.workflow_state
    );
    
    //if (frm.doc.workflow_state === "Paid") {
    let promise = new Promise(function (resolve, reject) {
    if (frm.selected_workflow_action === "Pay") {
        let installment = getNextInstallment(
          frm.doc.paid_1,
          frm.doc.paid_2,
          frm.doc.paid_3
        );

        if (frm.doc.balance < frm.doc[installment.fieldname]) {
          return alert("Payment is more than the balance!");
        }

        if (installment != -1) {
            
          frappe.show_progress(
            "Loading..",
            50,
            100,
            "Please wait"
          );
          
          createJournalEntry(installment.index, frm)
            .then(function (doc) {
              console.log(
                `${doc.doctype} ${doc.name} created on ${doc.creation}`
              );

              let paidField =
                "paid" + ("_" + installment.index);

              console.log(
                installment,
                paidField,
                "_" + installment.index
              );

              frm.set_value(paidField, 1);
              refresh_field(paidField);

              //   frm.save();
              resolve();
                       frappe.show_progress(
                        "Loading..",
                        100,
                        100,
                        "Please wait"
                      );

              frappe.set_route("Form", "Journal Entry", doc.name);
              //   frappe.set_route("Form", "Journal Entry", doc.name);
            })
            .catch((err) => {
              reject(err);
              console.log("Cant update Workflow State! => ", err);
            });
        }
      } else {
        //   frm.save();
        resolve();
      }
    });

    await promise.catch((err) => {
      console.log("err", err);
      return frappe.throw(err);
    });
  }
});
//end

function getAmount(gridRow) {
	let qty = gridRow.on_grid_fields_dict.qty.value;
	let rate = gridRow.on_grid_fields_dict.rate.value;
	let amount = qty * rate;
	frappe.model.set_value(
		gridRow.doc.doctype,
		gridRow.doc.name,
		'amount',
		amount
		);
}


frappe.ui.form.on("Administrative Memo", {
    after_workflow_action: (frm) => {
        if (frm.doc.workflow_state === "Entered") {
            frappe.db.insert({
                docstatus: 1, // submit doc
                doctype: 'Journal Entry',
                entry_type: 'Journal Entry',
                task: 'Administrative Memo',
                document_id: frm.doc.name,
                user_remark: frm.doc.description,
                posting_date: frappe.datetime.nowdate(),
                accounts: [
                    {
                        'account': frm.doc.expense_account,
                        'debit_in_account_currency': frm.doc.total,
                        'credit_in_account_currency': '',
                        'user_remark': frm.doc.subject,
                    },
                    frappe.ui.form.on('Admin Table', {
		"qty": function(frm, cdt, cdn) {
		let gridRow = frm.open_grid_row();
		if (!gridRow) {
			gridRow = frm.get_field('table').grid.get_row(cdn);
		}
		getAmount(gridRow);
	},
	
	"rate": function(frm, cdt, cdn) {
		let gridRow = frm.open_grid_row();
		if (!gridRow) {
			gridRow = frm.get_field('table').grid.get_row(cdn);
		}
		getAmount(gridRow);
	},
	
	amount: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.table.forEach(function (d) { total += d.amount; });
        frm.set_value("total", total);
        refresh_field("total");
    },
    
    table_remove: function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.table.forEach(function (d) { total += d.amount; });
        frm.set_value("total", total);
        refresh_field("total");
    },
    
})
//copied from mssl


function validateInstallments(frm, fieldNames) {
  return (
    !frm.doc[fieldNames.isPaidField] && (frm.doc[fieldNames.field]) >
    frm.doc.balance
  );
}

const payments = [
  { field: "first_payment", isPaidField: "paid_1" },
  { field: "second_payment", isPaidField: "paid_2" },
  { field: "third_payment", isPaidField: "paid_3" },
];


function sumPayments(frm) {
  frm.set_value(
    "total_paid",
    flt((frm.doc.paid_1 && frm.doc.first_payment) || 0) +
      flt((frm.doc.paid_2 && frm.doc.second_payment) || 0) +
      flt((frm.doc.paid_3 && frm.doc.third_payment) || 0)
  );

  getBalance(frm);
  
  //frm.save();

}

function getBalance(frm) {
  frm.set_value(
    "balance",
    flt(frm.doc.total || 0) - flt(frm.doc.total_paid || 0)
  );
}

frappe.ui.form.on("Administrative Memo", {
  refresh: function (frm) {
    sumPayments(frm);
  },
  before_save: function (frm) {
    payments.forEach((payment) => {
      if (validateInstallments(frm, payment)) {
        return frappe.throw(
          `${
            payment.field.split("_")[0]
          } Installment cannot be more than Balance!`
        );
      }
    });
  },
});

function getNextInstallment(paid_1, paid_2, paid_3) {
  if (paid_1 === 0) {
    return { index: 1, fieldname: "first_payment" };
  }

  if (paid_1 == 1 && paid_2 == 1) {
    return { index: 3, fieldname: "third_payment" };
  }

  if (paid_1 == 1 && paid_2 === 0) {
    return { index: 2, fieldname: "second_payment" };
  }

  if (paid_1 == 1 && paid_2 == 1 && paid_3 == 1) {
    return -1;
  }
}

function createJournalEntry(installment, frm) {
  let data = {};

  switch (installment) {
    case 1:
      data = [
        {
        'account': frm.doc.debit,
        'debit_in_account_currency': frm.doc.first_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark,
        },
        {
        'account': frm.doc.credit,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.first_payment,
        'user_remark': frm.doc.user_remark,
        },
      ];
      break;
    case 2:
      data = [
        {
        'account': frm.doc.debit_2,
        'debit_in_account_currency': frm.doc.second_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark_2,
        },
        {
        'account': frm.doc.credit_2,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.second_payment,
        'user_remark': frm.doc.user_remark_2,
        },
      ];
      break;
    case 3:
      data = [
        {
        'account': frm.doc.debit_3,
        'debit_in_account_currency': frm.doc.third_payment,
        'credit_in_account_currency': '',
        'user_remark': frm.doc.user_remark_3,
        },
        {
        'account': frm.doc.credit_3,
        'debit_in_account_currency': '',
        'credit_in_account_currency': frm.doc.third_payment,
        'user_remark': frm.doc.user_remark_3,
        },
      ];
      break;
  }
  return frappe.db.insert({
    doctype: "Journal Entry",
    docstatus: 0, // submit doc
    entry_type: "Journal Entry",
    documents: "Administrative Memo",
    document_id: frm.doc.name,
    user_remark: `AGENT: ${data[0].user_remark}`,
    posting_date: frappe.datetime.nowdate(),
    accounts: data,
  });
}


frappe.ui.form.on("Administrative Memo", {
     before_workflow_action: async function (frm) {
    console.log(
      "action => ",
      frm.selected_workflow_action,
      "State => ",
      frm.doc.workflow_state
    );
    
    //if (frm.doc.workflow_state === "Paid") {
    let promise = new Promise(function (resolve, reject) {
    if (frm.selected_workflow_action === "Pay") {
        let installment = getNextInstallment(
          frm.doc.paid_1,
          frm.doc.paid_2,
          frm.doc.paid_3
        );

        if (frm.doc.balance < frm.doc[installment.fieldname]) {
          return alert("Payment is more than the balance!");
        }

        if (installment != -1) {
            
          frappe.show_progress(
            "Loading..",
            50,
            100,
            "Please wait"
          );
          
          createJournalEntry(installment.index, frm)
            .then(function (doc) {
              console.log(
                `${doc.doctype} ${doc.name} created on ${doc.creation}`
              );

              let paidField =
                "paid" + ("_" + installment.index);

              console.log(
                installment,
                paidField,
                "_" + installment.index
              );

              frm.set_value(paidField, 1);
              refresh_field(paidField);

              //   frm.save();
              resolve();
                       frappe.show_progress(
                        "Loading..",
                        100,
                        100,
                        "Please wait"
                      );

              frappe.set_route("Form", "Journal Entry", doc.name);
              //   frappe.set_route("Form", "Journal Entry", doc.name);
            })
            .catch((err) => {
              reject(err);
              console.log("Cant update Workflow State! => ", err);
            });
        }
      } else {
        //   frm.save();
        resolve();
      }
    });

    await promise.catch((err) => {
      console.log("err", err);
      return frappe.throw(err);
    });
  }
});
//end

function getAmount(gridRow) {
	let qty = gridRow.on_grid_fields_dict.qty.value;
	let rate = gridRow.on_grid_fields_dict.rate.value;
	let amount = qty * rate;
	frappe.model.set_value(
		gridRow.doc.doctype,
		gridRow.doc.name,
		'amount',
		amount
		);
}


frappe.ui.form.on("Administrative Memo", {
    after_workflow_action: (frm) => {
        if (frm.doc.workflow_state === "Entered") {
            frappe.db.insert({
                docstatus: 1, // submit doc
                doctype: 'Journal Entry',
                entry_type: 'Journal Entry',
                task: 'Administrative Memo',
                document_id: frm.doc.name,
                user_remark: frm.doc.description,
                posting_date: frappe.datetime.nowdate(),
                accounts: [
                    {
                        'account': frm.doc.expense_account,
                        'debit_in_account_currency': frm.doc.total,
                        'credit_in_account_currency': '',
                        'user_remark': frm.doc.subject,
                    },
                    {
                        'account': frm.doc.bank_account,
                        'debit_in_account_currency': '',
                        'credit_in_account_currency': frm.doc.total,
                        'user_remark': frm.doc.subject,
                    }
                ]
                }).then(function(doc) { 
                    console.log(`${doc.doctype} ${doc.name} created on ${doc.creation}`);
                    
                    frappe.set_route("Form", "Journal Entry", doc.name);
                });
		    }
        }
});
{
                        'account': frm.doc.bank_account,
                        'debit_in_account_currency': '',
                        'credit_in_account_currency': frm.doc.total,
                        'user_remark': frm.doc.subject,
                    }
                ]
                }).then(function(doc) { 
                    console.log(`${doc.doctype} ${doc.name} created on ${doc.creation}`);
                    
                    frappe.set_route("Form", "Journal Entry", doc.name);
                });
		    }
        }
});
