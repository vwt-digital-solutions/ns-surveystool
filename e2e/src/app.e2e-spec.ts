import { browser, protractor, by, element, Capabilities, Key } from 'protractor';
const request = require('request');
const fs = require('fs');
// const downloadsFolder = require('downloads-folder');

const hasClass = (elt, cls) => {
  return elt.getAttribute('class').then((classes: string) => {
    return classes.split(' ').indexOf(cls) !== -1;
  });
};

describe('NS Survey Download Tool', () => {

  afterEach(() => {
    // browser.manage().logs().getAvailableLogTypes().then((logTypes) => {
    //   logTypes.forEach((logType) => {
    //     console.log(logType);
    //   });
    // });
    browser.manage().logs().get('browser').then((messages) => {
      messages.forEach((message) => {
        console.log(message.message);
      });
    });
    // browser.manage().logs().get('performance').then((browserLogs) => {
    //   browserLogs.forEach((browserLog) => {
    //     const message = JSON.parse(browserLog.message).message;
    //     // console.log('Performance: ' + browserLog.message);
    //     if (message.method === 'Network.responseReceived' || message.method === 'Network.dataReceived') {
    //       console.log(message);
    //     }
    //   });
    // });
  });

  it('should authenticate', () => {
    // tslint:disable-next-line: deprecation
    browser.ignoreSynchronization = true;
    const requestOptions = {
      method: 'GET',
      url: browser.params.login.token,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'client_credentials',
        client_id: browser.params.login.clientId,
        client_secret: browser.params.login.clientSecret,
        scope: browser.params.login.scope
      }
    };

    const get = (options: any): any => {
      const defer = protractor.promise.defer();

      request(options, (error, message) => {
        if (error || message.statusCode >= 400) {
          defer.reject({ error, message });
        } else {
          defer.fulfill(message);
        }
      });
      return defer.promise;
    };

    const setupCommon = (): any => {
      return get(requestOptions);
    };

    const flow = protractor.promise.controlFlow();
    flow.execute(setupCommon).then((response) => {
      const responseBody = JSON.parse((response as any).body);
      browser.get('/auth/' + encodeURI(JSON.stringify(responseBody))).then((() => {
        console.log('/auth/' + encodeURI(JSON.stringify(responseBody)));
        browser.getPageSource().then((text: string) => {
          fs.writeFile('ns-survey-auth.html', text, ((err: any) => {
            if (err) { fail(err); }
          }));
        });
      }),
        ((reason: any) => {
          console.log(reason);
        }));
    });

    // browser.pause();
    browser.sleep(4000);
  });

  it('it should show navbar after successfull authorization', () => {
    browser.get('/').then((value: any) => {
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-nav.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      expect(element.all(by.className('navbar')).count()).toEqual(1, 'Navbar must presetnt on the page');
    },
      (reason: any) => {
        console.log('Failure');
        fail(reason);
      });
  });

  it('it should show "Download CSV" button after successfull authorization', () => {
    browser.get('/').then((value: any) => {
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-csv.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      expect(element.all(by.css('button[title="Download CSV"]')).count()).toEqual(1, 'Download CSV must be present on the page');
      expect(element(by.css('button[title="Download CSV"]')).isDisplayed()).toBeFalsy();
    },
      (reason: any) => {
        console.log('Failure');
        fail(reason);
      });
  });

  it('it should show "Download ZIP" button after successfull authorization', () => {
    browser.get('/').then((value: any) => {
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-zip.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      expect(element.all(by.css('button[title="Download ZIP"]')).count()).toEqual(1, 'Download ZIP must be present on the page');
      expect(element(by.css('button[title="Download ZIP"]')).isDisplayed()).toBeFalsy();
    },
      (reason: any) => {
        console.log('Failure');
        fail(reason);
      });
  });

  it('it should show empty registrations list immediately after successfull authorization', () => {
    browser.get('/').then((value: any) => {
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-reg1.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      expect(element.all(by.css('li[class="registrations list"')).count()).toEqual(0, 'Links to downloads should not yet shown');
    },
      (reason: any) => {
        console.log('Failure');
        fail(reason);
      });
  });

  it('it should show registrations list after selection of survey', () => {
    browser.get('/').then((value: any) => {
      expect(element(by.tagName('ag-grid-angular')).isPresent()).toBeTruthy();
      expect(element(by.tagName('ag-grid-angular')).isDisplayed()).toBeFalsy();
      browser.sleep(4000);
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-reg2.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      element(by.id('typeahead-focus')).sendKeys('START WERK VERGADERING');
      element(by.id('typeahead-focus')).sendKeys(Key.TAB);
      element(by.id('surveys_button')).click();
      browser.sleep(1000);
      browser.getPageSource().then((text: string) => {
        fs.writeFile('ns-survey-reg2-2.html', text, ((err: any) => {
          if (err) { fail(err); }
        }));
      });
      element.all(by.css('button[title="Download CSV"]')).getText().then((txt) => { console.log(txt); });
      expect(element.all(by.css('button[title="Download CSV"]')).getText())
        .toEqual(['REGISTRATIONS'], 'Download CSV text must be initial');
      element.all(by.css('button[title="Download CSV"]')).click();
      element.all(by.css('button[title="Download CSV"]')).getText().then((txt) => { console.log(txt); });
      expect(element.all(by.css('button[title="Download CSV"]')).getText())
        .toEqual(['DOWNLOADING'], 'Download CSV text must be initial');
      browser.sleep(2000);
      element.all(by.css('button[title="Download CSV"]')).getText().then((txt) => { console.log(txt); });
      expect(element.all(by.css('button[title="Download CSV"]')).getText())
        .toEqual(['DOWNLOADED'], 'Download CSV text must indicate download finished');
      browser.sleep(2000);
      element.all(by.css('button[title="Download CSV"]')).getText().then((txt) => { console.log(txt); });
      expect(element.all(by.css('button[title="Download CSV"]')).getText())
        .toEqual(['JUST THE RESULTS'], 'Download CSV text must indicate download finished');
      expect(element(by.tagName('ag-grid-angular')).isDisplayed()).toBeTruthy();
      expect(element.all(by.css('button#registrationButton')).count()).toBeGreaterThan(0);
      },
      (reason: any) => {
        console.log('Failure');
        fail(reason);
      });
  });

});
