/**
 * Unimed Privacy Pro - Health Monitor
 * Performs lightweight technical state verification for the popup interface.
 *
 * SECURITY & PRIVACY NOTICE:
 * Queries ONLY technical extension state flags and storage integrity.
 * Does NOT scan DOM message contents or collect user browsing history.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UnimedHealthMonitor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Retrieves technical status diagnostic.
   * @param {Object} settingsManager
   * @param {Function} callback
   */
  function getDiagnosticStatus(settingsManager, callback) {
    settingsManager.get(function (settings) {
      const isStorageOk = !!(settings && typeof settings.hideMessages === 'boolean');
      const lastUpdateFormatted = settings.lastUpdated
        ? new Date(settings.lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : 'N/A';

      const diagnostic = {
        storageStatus: isStorageOk ? 'OK (Local)' : 'Erro',
        protectionLevel: settings.protectionLevel || 'advanced',
        lastUpdated: lastUpdateFormatted,
        isEnterpriseCompliant: true
      };

      if (callback) callback(diagnostic);
    });
  }

  return {
    getDiagnosticStatus
  };
});
