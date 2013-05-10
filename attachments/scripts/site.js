/**
 * site.js
 * main application logic appears here
 */
(function(window, document, $, Handlebars){

var
  
  /**
   * database object, used to communicate with couchdb.
   * principle methods include:
   * - openDoc() to read an existing document
   * - saveDoc() to save a new or existing document
   * - view() to retrieve data from a map/reduce view
   */
  db = window.db = $.couch.db(document.location.href.split('/')[3]),
  
  /**
   * handlebar templates
   */
  templates = (function(){
    var templates = {};
    $('script[type="text/x-handlebars-template"]')
      .each(function(){
        templates[this.className] = Handlebars.compile($(this).text());
      });
    return templates;
  })(),
  
  /**
   * convenience method for looking up a template and performing a handlebars
   * transformation on it to return HTML.
   */
  render = function(name, data) {
    var template = templates[name];
    if (!template) {
      throw "no templates have the name: " + name;
    }
    return template(data || {});
  },

  /**
   * application views (targets for Sammy routes)
   */
  views = {
    
    /**
     * main screen, welcome!
     */
    main: function(context) {
      context.$element().html(render('main'));
    },
    
    /**
     * list programs.
     */
    listPrograms: function(context) {
      db.view('editor/programs', {
        success: function(result){
          context.$element()
            .html(render('list-programs', result))
            .find('.list-programs tbody tr')
              .css('cursor', 'pointer')
              .click(function(e){
                app.setLocation('#/show-program/' + this.getAttribute('data-docid'));
              });
        }
      });
    },
    
    /**
     * show program page
     */
    showProgram: function(context) {
      db.openDoc(this.params._id, {
        success: function(program){
          context.$element()
            .html(render('show-program', program))
            .find('.run-program')
              .click(function(e){
                system.runtime.exec(program.code);
              });
          
        }
      });
    },
    
    /**
     * form for adding a new program.
     */
    addProgramForm: function(context) {
      context.$element().html(render('manage-program', {
        action: 'Add'
      }));
    },
    
    /**
     * form for editing an existing program.
     */
    editProgramForm: function(context) {
      db.openDoc(this.params._id, {
        success: function(program){
          context.$element()
            .html(render('manage-program', $.extend(program, {
              action: 'Edit'
            })));
        }
      });
    },
    
    /**
     * save a new or edited program.
     */
    saveProgram: function(context) {
      var id = context.params._id;
      db.saveDoc(context.params, {
        success: function(resp){
          if (id) {
            app.setLocation('#/show-program/' + id);
          } else {
            app.setLocation('#/list-programs');
          }
        }
      });
    },
    
    /**
     * form for deleting a program
     */
    deleteProgramForm: function(context) {
      db.openDoc(this.params._id, {
        success: function(program){
          context.$element().html(render('delete-program', program));
        }
      });
    },
    
    /**
     * delete the specified member.
     */
    deleteProgram: function(context) {
      db.saveDoc(context.params, {
        success: function(){
          app.setLocation('#/list-programs');
        }
      });
    }
    
  },
  
  /**
   * initialize the Sammy application, specifying routes.
   */
  app = window.app = $.sammy('.main', function() {
    
    // main entry point, welcome screen
    this.get('#/', views.main);
    
    // programs
    this.get('#/list-programs', views.listPrograms);
    this.get('#/show-program/:_id', views.showProgram);
    
    this.get('#/add-program', views.addProgramForm);
    this.get('#/edit-program/:_id', views.editProgramForm);
    this.post('#/save-program', views.saveProgram);
    
    this.get('#/delete-program/:_id', views.deleteProgramForm);
    this.post('#/delete-program', views.deleteProgram);
    
  });

// start the application
app.run('#/');

})(window, document, jQuery, Handlebars);
