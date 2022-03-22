import { PouchDBGeospatial } from 'pouchdb-geospatial'

declare global {
  namespace PouchDB {
    interface Static {
      //TODO: return PluggedInStatic<T>, which overwrites new and default to return extended Database interface
      // so we don't just extend the namespace, but instead really change the result of .plugin

      plugin<T extends {}>(plugin: T): Static
      //plugin(plugin: function(Static)): Static;
    }

    interface Database {
      geospatial(): PouchDBGeospatial
    }
  }
}
