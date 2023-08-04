(function (exports) {
  'use strict';

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  var SelectorType;
  (function (SelectorType) {
      SelectorType["CSS"] = "css";
      SelectorType["ARIA"] = "aria";
      SelectorType["Text"] = "text";
      SelectorType["XPath"] = "xpath";
      SelectorType["Pierce"] = "pierce";
  })(SelectorType = SelectorType || (SelectorType = {}));
  var StepType;
  (function (StepType) {
      StepType["Change"] = "change";
      StepType["Click"] = "click";
      StepType["Close"] = "close";
      StepType["CustomStep"] = "customStep";
      StepType["DoubleClick"] = "doubleClick";
      StepType["EmulateNetworkConditions"] = "emulateNetworkConditions";
      StepType["Hover"] = "hover";
      StepType["KeyDown"] = "keyDown";
      StepType["KeyUp"] = "keyUp";
      StepType["Navigate"] = "navigate";
      StepType["Scroll"] = "scroll";
      StepType["SetViewport"] = "setViewport";
      StepType["WaitForElement"] = "waitForElement";
      StepType["WaitForExpression"] = "waitForExpression";
  })(StepType = StepType || (StepType = {}));
  var AssertedEventType;
  (function (AssertedEventType) {
      AssertedEventType["Navigation"] = "navigation";
  })(AssertedEventType = AssertedEventType || (AssertedEventType = {}));

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  function assertAllStepTypesAreHandled(s) {
      throw new Error(`Unknown step type: ${s.type}`);
  }
  const typeableInputTypes = new Set([
      'textarea',
      'text',
      'url',
      'tel',
      'search',
      'password',
      'number',
      'email',
  ]);
  const pointerDeviceTypes = new Set([
      'mouse',
      'pen',
      'touch',
  ]);
  const mouseButtonMap = new Map([
      ['primary', 'left'],
      ['auxiliary', 'middle'],
      ['secondary', 'right'],
      ['back', 'back'],
      ['forward', 'forward'],
  ]);
  function hasProperty(data, prop) {
      // TODO: use Object.hasOwn once types are available https://github.com/microsoft/TypeScript/issues/44253
      if (!Object.prototype.hasOwnProperty.call(data, prop)) {
          return false;
      }
      const keyedData = data;
      return keyedData[prop] !== undefined;
  }
  function isObject(data) {
      return typeof data === 'object' && data !== null;
  }
  function isString(data) {
      return typeof data === 'string';
  }
  function isNumber(data) {
      return typeof data === 'number';
  }
  function isArray(data) {
      return Array.isArray(data);
  }
  function isBoolean(data) {
      return typeof data === 'boolean';
  }
  function isIntegerArray(data) {
      return isArray(data) && data.every((item) => Number.isInteger(item));
  }
  function isKnownDeviceType(data) {
      return typeof data === 'string' && pointerDeviceTypes.has(data);
  }
  function isKnownMouseButton(data) {
      return typeof data === 'string' && mouseButtonMap.has(data);
  }
  function parseTarget(step) {
      if (hasProperty(step, 'target') && isString(step.target)) {
          return step.target;
      }
      return undefined;
  }
  function parseFrame(step) {
      if (hasProperty(step, 'frame')) {
          if (isIntegerArray(step.frame)) {
              return step.frame;
          }
          throw new Error('Step `frame` is not an integer array');
      }
      return undefined;
  }
  function parseNumber(step, prop) {
      if (hasProperty(step, prop)) {
          const maybeNumber = step[prop];
          if (isNumber(maybeNumber)) {
              return maybeNumber;
          }
      }
      throw new Error(`Step.${prop} is not a number`);
  }
  function parseBoolean(step, prop) {
      if (hasProperty(step, prop)) {
          const maybeBoolean = step[prop];
          if (isBoolean(maybeBoolean)) {
              return maybeBoolean;
          }
      }
      throw new Error(`Step.${prop} is not a boolean`);
  }
  function parseOptionalNumber(step, prop) {
      if (hasProperty(step, prop)) {
          return parseNumber(step, prop);
      }
      return undefined;
  }
  function parseOptionalString(step, prop) {
      if (hasProperty(step, prop)) {
          return parseString(step, prop);
      }
      return undefined;
  }
  function parseOptionalBoolean(step, prop) {
      if (hasProperty(step, prop)) {
          return parseBoolean(step, prop);
      }
      return undefined;
  }
  function parseString(step, prop) {
      if (hasProperty(step, prop)) {
          const maybeString = step[prop];
          if (isString(maybeString)) {
              return maybeString;
          }
      }
      throw new Error(`Step.${prop} is not a string`);
  }
  function parseSelectors(step) {
      if (!hasProperty(step, 'selectors')) {
          throw new Error('Step does not have required selectors');
      }
      if (!isArray(step.selectors)) {
          throw new Error('Step selectors are not an array');
      }
      if (step.selectors.length === 0) {
          throw new Error('Step does not have required selectors');
      }
      return step.selectors.map((s) => {
          if (!isString(s) && !isArray(s)) {
              throw new Error('Selector is not an array or string');
          }
          if (isArray(s)) {
              return s.map((sub) => {
                  if (!isString(sub)) {
                      throw new Error('Selector element is not a string');
                  }
                  return sub;
              });
          }
          return s;
      });
  }
  function parseOptionalSelectors(step) {
      if (!hasProperty(step, 'selectors')) {
          return undefined;
      }
      return parseSelectors(step);
  }
  function parseAssertedEvent(event) {
      if (!isObject(event)) {
          throw new Error('Asserted event is not an object');
      }
      if (!hasProperty(event, 'type')) {
          throw new Error('Asserted event is missing type');
      }
      if (event.type === AssertedEventType.Navigation) {
          return {
              type: AssertedEventType.Navigation,
              url: parseOptionalString(event, 'url'),
              title: parseOptionalString(event, 'title'),
          };
      }
      throw new Error('Unknown assertedEvent type');
  }
  function parseAssertedEvents(events) {
      if (!isArray(events)) {
          return undefined;
      }
      return events.map(parseAssertedEvent);
  }
  function parseBaseStep(type, step) {
      if (hasProperty(step, 'timeout') &&
          isNumber(step.timeout) &&
          !validTimeout(step.timeout)) {
          throw new Error(timeoutErrorMessage);
      }
      return {
          type,
          assertedEvents: hasProperty(step, 'assertedEvents')
              ? parseAssertedEvents(step.assertedEvents)
              : undefined,
          timeout: hasProperty(step, 'timeout') && isNumber(step.timeout)
              ? step.timeout
              : undefined,
      };
  }
  function parseStepWithTarget(type, step) {
      return {
          ...parseBaseStep(type, step),
          target: parseTarget(step),
      };
  }
  function parseStepWithFrame(type, step) {
      return {
          ...parseStepWithTarget(type, step),
          frame: parseFrame(step),
      };
  }
  function parseStepWithSelectors(type, step) {
      return {
          ...parseStepWithFrame(type, step),
          selectors: parseSelectors(step),
      };
  }
  function parseClickAttributes(step) {
      const attributes = {
          offsetX: parseNumber(step, 'offsetX'),
          offsetY: parseNumber(step, 'offsetY'),
      };
      const deviceType = parseOptionalString(step, 'deviceType');
      if (deviceType) {
          if (!isKnownDeviceType(deviceType)) {
              throw new Error(`'deviceType' for click steps must be one of the following: ${[
                ...pointerDeviceTypes,
            ].join(', ')}`);
          }
          attributes.deviceType = deviceType;
      }
      const button = parseOptionalString(step, 'button');
      if (button) {
          if (!isKnownMouseButton(button)) {
              throw new Error(`'button' for click steps must be one of the following: ${[
                ...mouseButtonMap.keys(),
            ].join(', ')}`);
          }
          attributes.button = button;
      }
      return attributes;
  }
  function parseClickStep(step) {
      return {
          ...parseStepWithSelectors(StepType.Click, step),
          ...parseClickAttributes(step),
          type: StepType.Click,
          duration: parseOptionalNumber(step, 'duration'),
      };
  }
  function parseDoubleClickStep(step) {
      return {
          ...parseStepWithSelectors(StepType.DoubleClick, step),
          ...parseClickAttributes(step),
          type: StepType.DoubleClick,
      };
  }
  function parseHoverStep(step) {
      return {
          ...parseStepWithSelectors(StepType.Hover, step),
          type: StepType.Hover,
      };
  }
  function parseChangeStep(step) {
      return {
          ...parseStepWithSelectors(StepType.Change, step),
          type: StepType.Change,
          value: parseString(step, 'value'),
      };
  }
  function parseKeyDownStep(step) {
      return {
          ...parseStepWithTarget(StepType.KeyDown, step),
          type: StepType.KeyDown,
          // TODO: type-check keys.
          key: parseString(step, 'key'),
      };
  }
  function parseKeyUpStep(step) {
      return {
          ...parseStepWithTarget(StepType.KeyUp, step),
          type: StepType.KeyUp,
          // TODO: type-check keys.
          key: parseString(step, 'key'),
      };
  }
  function parseEmulateNetworkConditionsStep(step) {
      return {
          ...parseStepWithTarget(StepType.EmulateNetworkConditions, step),
          type: StepType.EmulateNetworkConditions,
          download: parseNumber(step, 'download'),
          upload: parseNumber(step, 'upload'),
          latency: parseNumber(step, 'latency'),
      };
  }
  function parseCloseStep(step) {
      return {
          ...parseStepWithTarget(StepType.Close, step),
          type: StepType.Close,
      };
  }
  function parseSetViewportStep(step) {
      return {
          ...parseStepWithTarget(StepType.SetViewport, step),
          type: StepType.SetViewport,
          width: parseNumber(step, 'width'),
          height: parseNumber(step, 'height'),
          deviceScaleFactor: parseNumber(step, 'deviceScaleFactor'),
          isMobile: parseBoolean(step, 'isMobile'),
          hasTouch: parseBoolean(step, 'hasTouch'),
          isLandscape: parseBoolean(step, 'isLandscape'),
      };
  }
  function parseScrollStep(step) {
      return {
          ...parseStepWithFrame(StepType.Scroll, step),
          type: StepType.Scroll,
          x: parseOptionalNumber(step, 'x'),
          y: parseOptionalNumber(step, 'y'),
          selectors: parseOptionalSelectors(step),
      };
  }
  function parseNavigateStep(step) {
      return {
          ...parseStepWithTarget(StepType.Navigate, step),
          type: StepType.Navigate,
          target: parseTarget(step),
          url: parseString(step, 'url'),
      };
  }
  function parseWaitForElementStep(step) {
      const operator = parseOptionalString(step, 'operator');
      if (operator && operator !== '>=' && operator !== '==' && operator !== '<=') {
          throw new Error("WaitForElement step's operator is not one of '>=','==','<='");
      }
      if (hasProperty(step, 'attributes')) {
          if (!isObject(step.attributes) ||
              Object.values(step.attributes).some((attribute) => typeof attribute !== 'string')) {
              throw new Error("WaitForElement step's attribute is not a dictionary of strings");
          }
      }
      if (hasProperty(step, 'properties')) {
          if (!isObject(step.properties)) {
              throw new Error("WaitForElement step's attribute is not an object");
          }
      }
      return {
          ...parseStepWithSelectors(StepType.WaitForElement, step),
          type: StepType.WaitForElement,
          operator: operator,
          count: parseOptionalNumber(step, 'count'),
          visible: parseOptionalBoolean(step, 'visible'),
          attributes: hasProperty(step, 'attributes')
              ? step.attributes
              : undefined,
          properties: hasProperty(step, 'properties')
              ? step.properties
              : undefined,
      };
  }
  function parseWaitForExpressionStep(step) {
      if (!hasProperty(step, 'expression')) {
          throw new Error('waitForExpression step is missing `expression`');
      }
      return {
          ...parseStepWithFrame(StepType.WaitForExpression, step),
          type: StepType.WaitForExpression,
          expression: parseString(step, 'expression'),
      };
  }
  function parseCustomStep(step) {
      if (!hasProperty(step, 'name')) {
          throw new Error('customStep is missing name');
      }
      if (!isString(step.name)) {
          throw new Error("customStep's name is not a string");
      }
      return {
          ...parseStepWithFrame(StepType.CustomStep, step),
          type: StepType.CustomStep,
          name: step.name,
          parameters: hasProperty(step, 'parameters') ? step.parameters : undefined,
      };
  }
  function parseStep(step, idx) {
      if (!isObject(step)) {
          throw new Error(idx ? `Step ${idx} is not an object` : 'Step is not an object');
      }
      if (!hasProperty(step, 'type')) {
          throw new Error(idx ? `Step ${idx} does not have a type` : 'Step does not have a type');
      }
      if (!isString(step.type)) {
          throw new Error(idx
              ? `Type of the step ${idx} is not a string`
              : 'Type of the step is not a string');
      }
      switch (step.type) {
          case StepType.Click:
              return parseClickStep(step);
          case StepType.DoubleClick:
              return parseDoubleClickStep(step);
          case StepType.Hover:
              return parseHoverStep(step);
          case StepType.Change:
              return parseChangeStep(step);
          case StepType.KeyDown:
              return parseKeyDownStep(step);
          case StepType.KeyUp:
              return parseKeyUpStep(step);
          case StepType.EmulateNetworkConditions:
              return parseEmulateNetworkConditionsStep(step);
          case StepType.Close:
              return parseCloseStep(step);
          case StepType.SetViewport:
              return parseSetViewportStep(step);
          case StepType.Scroll:
              return parseScrollStep(step);
          case StepType.Navigate:
              return parseNavigateStep(step);
          case StepType.CustomStep:
              return parseCustomStep(step);
          case StepType.WaitForElement:
              return parseWaitForElementStep(step);
          case StepType.WaitForExpression:
              return parseWaitForExpressionStep(step);
          default:
              throw new Error(`Step type ${step.type} is not supported`);
      }
  }
  function parseSteps(steps) {
      const result = [];
      if (!isArray(steps)) {
          throw new Error('Recording `steps` is not an array');
      }
      for (const [idx, step] of steps.entries()) {
          result.push(parseStep(step, idx));
      }
      return result;
  }
  function cleanUndefined(json) {
      return JSON.parse(JSON.stringify(json));
  }
  const minTimeout = 1;
  const maxTimeout = 30000;
  const timeoutErrorMessage = `Timeout is not between ${minTimeout} and ${maxTimeout} milliseconds`;
  function validTimeout(timeout) {
      return timeout >= minTimeout && timeout <= maxTimeout;
  }
  function parse(data) {
      if (!isObject(data)) {
          throw new Error('Recording is not an object');
      }
      if (!hasProperty(data, 'title')) {
          throw new Error('Recording is missing `title`');
      }
      if (!isString(data.title)) {
          throw new Error('Recording `title` is not a string');
      }
      if (hasProperty(data, 'timeout') && !isNumber(data.timeout)) {
          throw new Error('Recording `timeout` is not a number');
      }
      if (!hasProperty(data, 'steps')) {
          throw new Error('Recording is missing `steps`');
      }
      if (hasProperty(data, 'timeout') &&
          isNumber(data.timeout) &&
          !validTimeout(data.timeout)) {
          throw new Error(timeoutErrorMessage);
      }
      return cleanUndefined({
          title: data.title,
          timeout: hasProperty(data, 'timeout') && isNumber(data.timeout)
              ? data.timeout
              : undefined,
          selectorAttribute: hasProperty(data, 'selectorAttribute') && isString(data.selectorAttribute)
              ? data.selectorAttribute
              : undefined,
          steps: parseSteps(data.steps),
      });
  }

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  class StringifyExtension {
      async beforeAllSteps(out, flow) { }
      async afterAllSteps(out, flow) { }
      async beforeEachStep(out, step, flow) { }
      async stringifyStep(out, step, flow) { }
      async afterEachStep(out, step, flow) { }
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __classPrivateFieldGet$1(receiver, state, kind, f) {
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }

  function __classPrivateFieldSet(receiver, state, value, kind, f) {
      if (kind === "m") throw new TypeError("Private method is not writable");
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
  }

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  var _InMemoryLineWriter_indentation, _InMemoryLineWriter_currentIndentation, _InMemoryLineWriter_lines;
  class InMemoryLineWriter {
      constructor(indentation) {
          _InMemoryLineWriter_indentation.set(this, void 0);
          _InMemoryLineWriter_currentIndentation.set(this, 0);
          _InMemoryLineWriter_lines.set(this, []);
          __classPrivateFieldSet(this, _InMemoryLineWriter_indentation, indentation, "f");
      }
      appendLine(line) {
          const lines = line.split('\n').map((line) => {
              const indentedLine = line
                  ? __classPrivateFieldGet$1(this, _InMemoryLineWriter_indentation, "f").repeat(__classPrivateFieldGet$1(this, _InMemoryLineWriter_currentIndentation, "f")) + line.trimEnd()
                  : '';
              return indentedLine;
          });
          __classPrivateFieldGet$1(this, _InMemoryLineWriter_lines, "f").push(...lines);
          return this;
      }
      startBlock() {
          var _a;
          __classPrivateFieldSet(this, _InMemoryLineWriter_currentIndentation, (_a = __classPrivateFieldGet$1(this, _InMemoryLineWriter_currentIndentation, "f"), _a++, _a), "f");
          return this;
      }
      endBlock() {
          var _a;
          __classPrivateFieldSet(this, _InMemoryLineWriter_currentIndentation, (_a = __classPrivateFieldGet$1(this, _InMemoryLineWriter_currentIndentation, "f"), _a--, _a), "f");
          return this;
      }
      toString() {
          // Scripts should end with a final blank line.
          return __classPrivateFieldGet$1(this, _InMemoryLineWriter_lines, "f").join('\n') + '\n';
      }
      getIndent() {
          return __classPrivateFieldGet$1(this, _InMemoryLineWriter_indentation, "f");
      }
      getSize() {
          return __classPrivateFieldGet$1(this, _InMemoryLineWriter_lines, "f").length;
      }
  }
  _InMemoryLineWriter_indentation = new WeakMap(), _InMemoryLineWriter_currentIndentation = new WeakMap(), _InMemoryLineWriter_lines = new WeakMap();

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  /**
   * Copyright (c) 2020 The Chromium Authors. All rights reserved.
   * Use of this source code is governed by a BSD-style license that can be
   * found in the LICENSE file.
   */
  function formatJSONAsJS(json, indent) {
      const buffer = [];
      format(json, buffer, 1, indent);
      return buffer.join('');
  }
  function format(json, buffer = [], level = 1, indent = '  ') {
      switch (typeof json) {
          case 'bigint':
          case 'symbol':
          case 'function':
          case 'undefined':
              throw new Error('Invalid JSON');
          case 'number':
          case 'boolean':
              buffer.push(String(json));
              break;
          case 'string':
              buffer.push(formatAsJSLiteral$1(json));
              break;
          case 'object': {
              if (json === null) {
                  buffer.push('null');
              }
              else if (Array.isArray(json)) {
                  buffer.push('[\n');
                  for (let i = 0; i < json.length; i++) {
                      buffer.push(indent.repeat(level));
                      format(json[i], buffer, level + 1, indent);
                      if (i !== json.length - 1) {
                          buffer.push(',');
                      }
                      buffer.push('\n');
                  }
                  buffer.push(indent.repeat(level - 1) + ']');
              }
              else {
                  buffer.push('{\n');
                  const keys = Object.keys(json);
                  for (let i = 0; i < keys.length; i++) {
                      const key = keys[i];
                      const value = json[key];
                      if (value === undefined) {
                          continue;
                      }
                      buffer.push(indent.repeat(level));
                      buffer.push(key);
                      buffer.push(': ');
                      format(value, buffer, level + 1, indent);
                      if (i !== keys.length - 1) {
                          buffer.push(',');
                      }
                      buffer.push('\n');
                  }
                  buffer.push(indent.repeat(level - 1) + '}');
              }
              break;
          }
          default:
              throw new Error('Unknown object type');
      }
      return buffer;
  }
  // Taken from https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/core/platform/string-utilities.ts;l=29;drc=111134437ee51d74433829bed0088f7239e18867.
  const toHexadecimal = (charCode, padToLength) => {
      return charCode.toString(16).toUpperCase().padStart(padToLength, '0');
  };
  // Remember to update the third group in the regexps patternsToEscape and
  // patternsToEscapePlusSingleQuote when adding new entries in this map.
  const escapedReplacements = new Map([
      ['\b', '\\b'],
      ['\f', '\\f'],
      ['\n', '\\n'],
      ['\r', '\\r'],
      ['\t', '\\t'],
      ['\v', '\\v'],
      ["'", "\\'"],
      ['\\', '\\\\'],
      ['<!--', '\\x3C!--'],
      ['<script', '\\x3Cscript'],
      ['</script', '\\x3C/script'],
  ]);
  const formatAsJSLiteral$1 = (content) => {
      const patternsToEscape = /(\\|<(?:!--|\/?script))|(\p{Control})|(\p{Surrogate})/gu;
      const patternsToEscapePlusSingleQuote = /(\\|'|<(?:!--|\/?script))|(\p{Control})|(\p{Surrogate})/gu;
      const escapePattern = (match, pattern, controlChar, loneSurrogate) => {
          if (controlChar) {
              if (escapedReplacements.has(controlChar)) {
                  // @ts-ignore https://github.com/microsoft/TypeScript/issues/13086
                  return escapedReplacements.get(controlChar);
              }
              const twoDigitHex = toHexadecimal(controlChar.charCodeAt(0), 2);
              return '\\x' + twoDigitHex;
          }
          if (loneSurrogate) {
              const fourDigitHex = toHexadecimal(loneSurrogate.charCodeAt(0), 4);
              return '\\u' + fourDigitHex;
          }
          if (pattern) {
              return escapedReplacements.get(pattern) || '';
          }
          return match;
      };
      let escapedContent = '';
      let quote = '';
      if (!content.includes("'")) {
          quote = "'";
          escapedContent = content.replace(patternsToEscape, escapePattern);
      }
      else if (!content.includes('"')) {
          quote = '"';
          escapedContent = content.replace(patternsToEscape, escapePattern);
      }
      else if (!content.includes('`') && !content.includes('${')) {
          quote = '`';
          escapedContent = content.replace(patternsToEscape, escapePattern);
      }
      else {
          quote = "'";
          escapedContent = content.replace(patternsToEscapePlusSingleQuote, escapePattern);
      }
      return `${quote}${escapedContent}${quote}`;
  };

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  var _PuppeteerStringifyExtension_instances, _PuppeteerStringifyExtension_appendTarget, _PuppeteerStringifyExtension_appendFrame, _PuppeteerStringifyExtension_appendContext, _PuppeteerStringifyExtension_appendWaitForSelector, _PuppeteerStringifyExtension_appendClickStep, _PuppeteerStringifyExtension_appendDoubleClickStep, _PuppeteerStringifyExtension_appendHoverStep, _PuppeteerStringifyExtension_appendChangeStep, _PuppeteerStringifyExtension_appendEmulateNetworkConditionsStep, _PuppeteerStringifyExtension_appendKeyDownStep, _PuppeteerStringifyExtension_appendKeyUpStep, _PuppeteerStringifyExtension_appendCloseStep, _PuppeteerStringifyExtension_appendViewportStep, _PuppeteerStringifyExtension_appendScrollStep, _PuppeteerStringifyExtension_appendStepType, _PuppeteerStringifyExtension_appendNavigationStep, _PuppeteerStringifyExtension_appendWaitExpressionStep, _PuppeteerStringifyExtension_appendWaitForElementStep;
  class PuppeteerStringifyExtension extends StringifyExtension {
      constructor() {
          super(...arguments);
          _PuppeteerStringifyExtension_instances.add(this);
      }
      async beforeAllSteps(out, flow) {
          out.appendLine("const puppeteer = require('puppeteer'); // v13.0.0 or later");
          out.appendLine('');
          out.appendLine('(async () => {').startBlock();
          out.appendLine('const browser = await puppeteer.launch();');
          out.appendLine('const page = await browser.newPage();');
          out.appendLine(`const timeout = ${flow.timeout || defaultTimeout};`);
          out.appendLine('page.setDefaultTimeout(timeout);');
          out.appendLine('');
      }
      async afterAllSteps(out, flow) {
          out.appendLine('');
          out.appendLine('await browser.close();');
          out.appendLine('');
          for (const line of helpers.split('\n')) {
              out.appendLine(line);
          }
          out.endBlock().appendLine('})().catch(err => {').startBlock();
          out.appendLine('console.error(err);');
          out.appendLine('process.exit(1);');
          out.endBlock().appendLine('});');
      }
      async stringifyStep(out, step, flow) {
          out.appendLine('{').startBlock();
          if (step.timeout !== undefined) {
              out.appendLine(`const timeout = ${step.timeout};`);
          }
          __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendContext).call(this, out, step);
          if (step.assertedEvents) {
              out.appendLine('const promises = [];');
              for (const event of step.assertedEvents) {
                  switch (event.type) {
                      case AssertedEventType.Navigation: {
                          out.appendLine(`promises.push(${'frame' in step && step.frame ? 'frame' : 'targetPage'}.waitForNavigation());`);
                          break;
                      }
                      default:
                          throw new Error(`Event type ${event.type} is not supported`);
                  }
              }
          }
          __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendStepType).call(this, out, step);
          if (step.assertedEvents) {
              out.appendLine('await Promise.all(promises);');
          }
          out.endBlock().appendLine('}');
      }
  }
  _PuppeteerStringifyExtension_instances = new WeakSet(), _PuppeteerStringifyExtension_appendTarget = function _PuppeteerStringifyExtension_appendTarget(out, target) {
      if (target === 'main') {
          out.appendLine('const targetPage = page;');
      }
      else {
          out.appendLine(`const target = await browser.waitForTarget(t => t.url() === ${formatJSONAsJS(target, out.getIndent())}, { timeout });`);
          out.appendLine('const targetPage = await target.page();');
          out.appendLine('targetPage.setDefaultTimeout(timeout);');
      }
  }, _PuppeteerStringifyExtension_appendFrame = function _PuppeteerStringifyExtension_appendFrame(out, path) {
      out.appendLine('let frame = targetPage.mainFrame();');
      for (const index of path) {
          out.appendLine(`frame = frame.childFrames()[${index}];`);
      }
  }, _PuppeteerStringifyExtension_appendContext = function _PuppeteerStringifyExtension_appendContext(out, step) {
      // TODO fix optional target: should it be main?
      __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendTarget).call(this, out, step.target || 'main');
      // TODO fix optional frame: should it be required?
      if (step.frame) {
          __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendFrame).call(this, out, step.frame);
      }
  }, _PuppeteerStringifyExtension_appendWaitForSelector = function _PuppeteerStringifyExtension_appendWaitForSelector(out, step) {
      out.appendLine(`await scrollIntoViewIfNeeded(${formatJSONAsJS(step.selectors, out.getIndent())}, ${step.frame ? 'frame' : 'targetPage'}, timeout);`);
      out.appendLine(`const element = await waitForSelectors(${formatJSONAsJS(step.selectors, out.getIndent())}, ${step.frame ? 'frame' : 'targetPage'}, { timeout, visible: true });`);
  }, _PuppeteerStringifyExtension_appendClickStep = function _PuppeteerStringifyExtension_appendClickStep(out, step) {
      __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForSelector).call(this, out, step);
      out.appendLine('await element.click({');
      if (step.duration) {
          out.appendLine(`  delay: ${step.duration},`);
      }
      if (step.button) {
          out.appendLine(`  button: '${mouseButtonMap.get(step.button)}',`);
      }
      out.appendLine('  offset: {');
      out.appendLine(`    x: ${step.offsetX},`);
      out.appendLine(`    y: ${step.offsetY},`);
      out.appendLine('  },');
      out.appendLine('});');
  }, _PuppeteerStringifyExtension_appendDoubleClickStep = function _PuppeteerStringifyExtension_appendDoubleClickStep(out, step) {
      __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForSelector).call(this, out, step);
      out.appendLine('await element.click({');
      out.appendLine(`  clickCount: 2,`);
      if (step.button) {
          out.appendLine(`  button: '${mouseButtonMap.get(step.button)}',`);
      }
      out.appendLine('  offset: {');
      out.appendLine(`    x: ${step.offsetX},`);
      out.appendLine(`    y: ${step.offsetY},`);
      out.appendLine('  },');
      out.appendLine('});');
  }, _PuppeteerStringifyExtension_appendHoverStep = function _PuppeteerStringifyExtension_appendHoverStep(out, step) {
      __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForSelector).call(this, out, step);
      out.appendLine('await element.hover();');
  }, _PuppeteerStringifyExtension_appendChangeStep = function _PuppeteerStringifyExtension_appendChangeStep(out, step) {
      __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForSelector).call(this, out, step);
      out.appendLine('const inputType = await element.evaluate(el => el.type);');
      out.appendLine(`if (inputType === 'select-one') {`);
      out.appendLine(`  await changeSelectElement(element, ${formatJSONAsJS(step.value, out.getIndent())})`);
      out.appendLine(`} else if (${formatJSONAsJS(Array.from(typeableInputTypes), out.getIndent())}.includes(inputType)) {`);
      out.appendLine(`  await typeIntoElement(element, ${formatJSONAsJS(step.value, out.getIndent())});`);
      out.appendLine('} else {');
      out.appendLine(`  await changeElementValue(element, ${formatJSONAsJS(step.value, out.getIndent())});`);
      out.appendLine('}');
  }, _PuppeteerStringifyExtension_appendEmulateNetworkConditionsStep = function _PuppeteerStringifyExtension_appendEmulateNetworkConditionsStep(out, step) {
      out.appendLine('await targetPage.emulateNetworkConditions({');
      out.appendLine(`  offline: ${!step.download && !step.upload},`);
      out.appendLine(`  downloadThroughput: ${step.download},`);
      out.appendLine(`  uploadThroughput: ${step.upload},`);
      out.appendLine(`  latency: ${step.latency},`);
      out.appendLine('});');
  }, _PuppeteerStringifyExtension_appendKeyDownStep = function _PuppeteerStringifyExtension_appendKeyDownStep(out, step) {
      out.appendLine(`await targetPage.keyboard.down(${formatJSONAsJS(step.key, out.getIndent())});`);
  }, _PuppeteerStringifyExtension_appendKeyUpStep = function _PuppeteerStringifyExtension_appendKeyUpStep(out, step) {
      out.appendLine(`await targetPage.keyboard.up(${formatJSONAsJS(step.key, out.getIndent())});`);
  }, _PuppeteerStringifyExtension_appendCloseStep = function _PuppeteerStringifyExtension_appendCloseStep(out, step) {
      out.appendLine('await targetPage.close()');
  }, _PuppeteerStringifyExtension_appendViewportStep = function _PuppeteerStringifyExtension_appendViewportStep(out, step) {
      out.appendLine(`await targetPage.setViewport(${formatJSONAsJS({
        width: step.width,
        height: step.height,
    }, out.getIndent())})`);
  }, _PuppeteerStringifyExtension_appendScrollStep = function _PuppeteerStringifyExtension_appendScrollStep(out, step) {
      if ('selectors' in step) {
          __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForSelector).call(this, out, step);
          out.appendLine(`await element.evaluate((el, x, y) => { el.scrollTop = y; el.scrollLeft = x; }, ${step.x}, ${step.y});`);
      }
      else {
          out.appendLine(`await targetPage.evaluate((x, y) => { window.scroll(x, y); }, ${step.x}, ${step.y})`);
      }
  }, _PuppeteerStringifyExtension_appendStepType = function _PuppeteerStringifyExtension_appendStepType(out, step) {
      switch (step.type) {
          case StepType.Click:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendClickStep).call(this, out, step);
          case StepType.DoubleClick:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendDoubleClickStep).call(this, out, step);
          case StepType.Hover:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendHoverStep).call(this, out, step);
          case StepType.Change:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendChangeStep).call(this, out, step);
          case StepType.EmulateNetworkConditions:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendEmulateNetworkConditionsStep).call(this, out, step);
          case StepType.KeyDown:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendKeyDownStep).call(this, out, step);
          case StepType.KeyUp:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendKeyUpStep).call(this, out, step);
          case StepType.Close:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendCloseStep).call(this, out, step);
          case StepType.SetViewport:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendViewportStep).call(this, out, step);
          case StepType.Scroll:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendScrollStep).call(this, out, step);
          case StepType.Navigate:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendNavigationStep).call(this, out, step);
          case StepType.WaitForElement:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitForElementStep).call(this, out, step);
          case StepType.WaitForExpression:
              return __classPrivateFieldGet$1(this, _PuppeteerStringifyExtension_instances, "m", _PuppeteerStringifyExtension_appendWaitExpressionStep).call(this, out, step);
          case StepType.CustomStep:
              return; // TODO: implement these
          default:
              return assertAllStepTypesAreHandled(step);
      }
  }, _PuppeteerStringifyExtension_appendNavigationStep = function _PuppeteerStringifyExtension_appendNavigationStep(out, step) {
      out.appendLine(`await targetPage.goto(${formatJSONAsJS(step.url, out.getIndent())});`);
  }, _PuppeteerStringifyExtension_appendWaitExpressionStep = function _PuppeteerStringifyExtension_appendWaitExpressionStep(out, step) {
      out.appendLine(`await ${step.frame ? 'frame' : 'targetPage'}.waitForFunction(${formatJSONAsJS(step.expression, out.getIndent())}, { timeout });`);
  }, _PuppeteerStringifyExtension_appendWaitForElementStep = function _PuppeteerStringifyExtension_appendWaitForElementStep(out, step) {
      out.appendLine(`await waitForElement(${formatJSONAsJS(step, out.getIndent())}, ${step.frame ? 'frame' : 'targetPage'}, timeout);`);
  };
  const defaultTimeout = 5000;
  const helpers = `async function waitForSelectors(selectors, frame, options) {
  for (const selector of selectors) {
    try {
      return await waitForSelector(selector, frame, options);
    } catch (err) {
      console.error(err);
    }
  }
  throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
}

async function scrollIntoViewIfNeeded(selectors, frame, timeout) {
  const element = await waitForSelectors(selectors, frame, { visible: false, timeout });
  if (!element) {
    throw new Error(
      'The element could not be found.'
    );
  }
  await waitForConnected(element, timeout);
  const isInViewport = await element.isIntersectingViewport({threshold: 0});
  if (isInViewport) {
    return;
  }
  await element.evaluate(element => {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'auto',
    });
  });
  await waitForInViewport(element, timeout);
}

async function waitForConnected(element, timeout) {
  await waitForFunction(async () => {
    return await element.getProperty('isConnected');
  }, timeout);
}

async function waitForInViewport(element, timeout) {
  await waitForFunction(async () => {
    return await element.isIntersectingViewport({threshold: 0});
  }, timeout);
}

async function waitForSelector(selector, frame, options) {
  if (!Array.isArray(selector)) {
    selector = [selector];
  }
  if (!selector.length) {
    throw new Error('Empty selector provided to waitForSelector');
  }
  let element = null;
  for (let i = 0; i < selector.length; i++) {
    const part = selector[i];
    if (element) {
      element = await element.waitForSelector(part, options);
    } else {
      element = await frame.waitForSelector(part, options);
    }
    if (!element) {
      throw new Error('Could not find element: ' + selector.join('>>'));
    }
    if (i < selector.length - 1) {
      element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
    }
  }
  if (!element) {
    throw new Error('Could not find element: ' + selector.join('|'));
  }
  return element;
}

async function waitForElement(step, frame, timeout) {
  const {
    count = 1,
    operator = '>=',
    visible = true,
    properties,
    attributes,
  } = step;
  const compFn = {
    '==': (a, b) => a === b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
  }[operator];
  await waitForFunction(async () => {
    const elements = await querySelectorsAll(step.selectors, frame);
    let result = compFn(elements.length, count);
    const elementsHandle = await frame.evaluateHandle((...elements) => {
      return elements;
    }, ...elements);
    await Promise.all(elements.map((element) => element.dispose()));
    if (result && (properties || attributes)) {
      result = await elementsHandle.evaluate(
        (elements, properties, attributes) => {
          for (const element of elements) {
            if (attributes) {
              for (const [name, value] of Object.entries(attributes)) {
                if (element.getAttribute(name) !== value) {
                  return false;
                }
              }
            }
            if (properties) {
              if (!isDeepMatch(properties, element)) {
                return false;
              }
            }
          }
          return true;

          function isDeepMatch(a, b) {
            if (a === b) {
              return true;
            }
            if ((a && !b) || (!a && b)) {
              return false;
            }
            if (!(a instanceof Object) || !(b instanceof Object)) {
              return false;
            }
            for (const [key, value] of Object.entries(a)) {
              if (!isDeepMatch(value, b[key])) {
                return false;
              }
            }
            return true;
          }
        },
        properties,
        attributes
      );
    }
    await elementsHandle.dispose();
    return result === visible;
  }, timeout);
}

async function querySelectorsAll(selectors, frame) {
  for (const selector of selectors) {
    const result = await querySelectorAll(selector, frame);
    if (result.length) {
      return result;
    }
  }
  return [];
}

async function querySelectorAll(selector, frame) {
  if (!Array.isArray(selector)) {
    selector = [selector];
  }
  if (!selector.length) {
    throw new Error('Empty selector provided to querySelectorAll');
  }
  let elements = [];
  for (let i = 0; i < selector.length; i++) {
    const part = selector[i];
    if (i === 0) {
      elements = await frame.$$(part);
    } else {
      const tmpElements = elements;
      elements = [];
      for (const el of tmpElements) {
        elements.push(...(await el.$$(part)));
      }
    }
    if (elements.length === 0) {
      return [];
    }
    if (i < selector.length - 1) {
      const tmpElements = [];
      for (const el of elements) {
        const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        if (newEl) {
          tmpElements.push(newEl);
        }
      }
      elements = tmpElements;
    }
  }
  return elements;
}

async function waitForFunction(fn, timeout) {
  let isActive = true;
  const timeoutId = setTimeout(() => {
    isActive = false;
  }, timeout);
  while (isActive) {
    const result = await fn();
    if (result) {
      clearTimeout(timeoutId);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out');
}

async function changeSelectElement(element, value) {
  await element.select(value);
  await element.evaluateHandle((e) => {
    e.blur();
    e.focus();
  });
}

async function changeElementValue(element, value) {
  await element.focus();
  await element.evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function typeIntoElement(element, value) {
  const textToType = await element.evaluate((input, newValue) => {
    if (
      newValue.length <= input.value.length ||
      !newValue.startsWith(input.value)
    ) {
      input.value = '';
      return newValue;
    }
    const originalValue = input.value;
    input.value = '';
    input.value = originalValue;
    return newValue.substring(originalValue.length);
  }, value);
  await element.type(textToType);
}`;

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  alpha.split('').reduce((acc, char, idx) => {
      acc.set(char, idx);
      return acc;
  }, new Map());
  const LEAST_5_BIT_MASK = 0b011111;
  const CONTINUATION_BIT_MASK = 0b100000;
  const MAX_INT = 2147483647;
  /**
   * Encoding variable length integer into base64 (6-bit):
   *
   * 1 N N N N N | 0 N N N N N
   *
   * The first bit indicates if there is more data for the int.
   */
  function encodeInt(num) {
      if (num < 0) {
          throw new Error('Only postive integers and zero are supported');
      }
      if (num > MAX_INT) {
          throw new Error('Only integers between 0 and ' + MAX_INT + ' are supported');
      }
      const result = [];
      do {
          let payload = num & LEAST_5_BIT_MASK;
          num >>>= 5;
          if (num > 0)
              payload |= CONTINUATION_BIT_MASK;
          result.push(alpha[payload]);
      } while (num !== 0);
      return result.join('');
  }
  function encode(nums) {
      const parts = [];
      for (const num of nums) {
          parts.push(encodeInt(num));
      }
      return parts.join('');
  }

  /**
      Copyright 2022 Google LLC

      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at

          https://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
   */
  const SOURCE_MAP_PREFIX = '//# recorderSourceMap=';
  /**
   * Stringifes an entire recording. The following hooks are invoked with the `flow` parameter containing the entire flow:
   * - `beforeAllSteps` (once)
   * - `beforeEachStep` (per step)
   * - `stringifyStep` (per step)
   * - `afterEachStep` (per step)
   * - `afterAllSteps` (once)
   */
  async function stringify(flow, opts) {
      var _a, _b, _c, _d, _e, _f, _g;
      if (!opts) {
          opts = {};
      }
      const ext = (_a = opts.extension) !== null && _a !== void 0 ? _a : new PuppeteerStringifyExtension();
      const out = (_b = opts.writer) !== null && _b !== void 0 ? _b : new InMemoryLineWriter((_c = opts.indentation) !== null && _c !== void 0 ? _c : '  ');
      await ((_d = ext.beforeAllSteps) === null || _d === void 0 ? void 0 : _d.call(ext, out, flow));
      const sourceMap = [1]; // The first int indicates the version.
      for (const step of flow.steps) {
          const firstLine = out.getSize();
          await ((_e = ext.beforeEachStep) === null || _e === void 0 ? void 0 : _e.call(ext, out, step, flow));
          await ext.stringifyStep(out, step, flow);
          await ((_f = ext.afterEachStep) === null || _f === void 0 ? void 0 : _f.call(ext, out, step, flow));
          const lastLine = out.getSize();
          sourceMap.push(...[firstLine, lastLine - firstLine]);
      }
      await ((_g = ext.afterAllSteps) === null || _g === void 0 ? void 0 : _g.call(ext, out, flow));
      out.appendLine(SOURCE_MAP_PREFIX + encode(sourceMap));
      return out.toString();
  }
  /**
   * Stringifes a single step. Only the following hooks are invoked with the `flow` parameter as undefined:
   * - `beforeEachStep`
   * - `stringifyStep`
   * - `afterEachStep`
   */
  async function stringifyStep(step, opts) {
      var _a, _b, _c, _d;
      if (!opts) {
          opts = {};
      }
      let ext = opts.extension;
      if (!ext) {
          ext = new PuppeteerStringifyExtension();
      }
      if (!opts.indentation) {
          opts.indentation = '  ';
      }
      const out = (_a = opts.writer) !== null && _a !== void 0 ? _a : new InMemoryLineWriter((_b = opts.indentation) !== null && _b !== void 0 ? _b : '  ');
      await ((_c = ext.beforeEachStep) === null || _c === void 0 ? void 0 : _c.call(ext, out, step));
      await ext.stringifyStep(out, step);
      await ((_d = ext.afterEachStep) === null || _d === void 0 ? void 0 : _d.call(ext, out, step));
      return out.toString();
  }

  const supportedRecorderKeys = {
      backspace: 'backspace',
      enter: 'enter',
      arrowUp: 'upArrow',
      arrowDown: 'downArrow',
      arrowLeft: 'leftArrow',
      arrowRight: 'rightArrow',
      escape: 'esc',
      pageUp: 'pageUp',
      pageDown: 'pageDown',
      end: 'end',
      home: 'home',
      insert: 'insert',
  };

  var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
  var _CypressStringifyExtension_instances, _CypressStringifyExtension_appendStepType, _CypressStringifyExtension_appendChangeStep, _CypressStringifyExtension_appendClickStep, _CypressStringifyExtension_appendDoubleClickStep, _CypressStringifyExtension_appendHoverStep, _CypressStringifyExtension_appendKeyDownStep, _CypressStringifyExtension_appendNavigationStep, _CypressStringifyExtension_appendScrollStep, _CypressStringifyExtension_appendViewportStep;
  class CypressStringifyExtension extends StringifyExtension {
      constructor() {
          super(...arguments);
          _CypressStringifyExtension_instances.add(this);
      }
      async beforeAllSteps(out, flow) {
          out.appendLine(`describe(${formatAsJSLiteral(flow.title)}, () => {`).startBlock();
          out
              .appendLine(`it(${formatAsJSLiteral(`tests ${flow.title}`)}, () => {`)
              .startBlock();
      }
      async afterAllSteps(out) {
          out.endBlock().appendLine('});');
          out.endBlock().appendLine('});');
      }
      async stringifyStep(out, step, flow) {
          __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendStepType).call(this, out, step, flow);
          if (step.assertedEvents) ;
      }
  }
  _CypressStringifyExtension_instances = new WeakSet(), _CypressStringifyExtension_appendStepType = function _CypressStringifyExtension_appendStepType(out, step, flow) {
      switch (step.type) {
          case StepType.Click:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendClickStep).call(this, out, step, flow);
          case StepType.DoubleClick:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendDoubleClickStep).call(this, out, step, flow);
          case StepType.Change:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendChangeStep).call(this, out, step, flow);
          case StepType.SetViewport:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendViewportStep).call(this, out, step);
          case StepType.Scroll:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendScrollStep).call(this, out, step, flow);
          case StepType.Navigate:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendNavigationStep).call(this, out, step);
          case StepType.KeyDown:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendKeyDownStep).call(this, out, step);
          case StepType.Hover:
              return __classPrivateFieldGet(this, _CypressStringifyExtension_instances, "m", _CypressStringifyExtension_appendHoverStep).call(this, out, step, flow);
      }
  }, _CypressStringifyExtension_appendChangeStep = function _CypressStringifyExtension_appendChangeStep(out, step, flow) {
      const cySelector = handleSelectors(step.selectors, flow);
      if (cySelector) {
          out.appendLine(`${cySelector}.type(${formatAsJSLiteral(step.value)});`);
      }
  }, _CypressStringifyExtension_appendClickStep = function _CypressStringifyExtension_appendClickStep(out, step, flow) {
      const cySelector = handleSelectors(step.selectors, flow);
      const hasRightClick = step.button && step.button === 'secondary';
      if (cySelector) {
          hasRightClick
              ? out.appendLine(`${cySelector}.rightclick();`)
              : out.appendLine(`${cySelector}.click();`);
      }
      else {
          console.log(`Warning: The click on ${step.selectors[0]} was not able to be exported to Cypress. Please adjust your selectors and try again.`);
      }
      if (step.assertedEvents) {
          step.assertedEvents.forEach((event) => {
              if (event.type === 'navigation') {
                  out.appendLine(`cy.location("href").should("eq", "${event.url}");`);
              }
          });
      }
  }, _CypressStringifyExtension_appendDoubleClickStep = function _CypressStringifyExtension_appendDoubleClickStep(out, step, flow) {
      const cySelector = handleSelectors(step.selectors, flow);
      if (cySelector) {
          out.appendLine(`${cySelector}.dblclick();`);
      }
      else {
          console.log(`Warning: The click on ${step.selectors[0]} was not able to be exported to Cypress. Please adjust your selectors and try again.`);
      }
  }, _CypressStringifyExtension_appendHoverStep = function _CypressStringifyExtension_appendHoverStep(out, step, flow) {
      const cySelector = handleSelectors(step.selectors, flow);
      if (cySelector) {
          out.appendLine(`${cySelector}.trigger("mouseover");`);
      }
  }, _CypressStringifyExtension_appendKeyDownStep = function _CypressStringifyExtension_appendKeyDownStep(out, step) {
      const pressedKey = step.key.toLowerCase();
      if (pressedKey in supportedRecorderKeys) {
          const keyValue = supportedRecorderKeys[pressedKey];
          out.appendLine(`cy.type(${formatAsJSLiteral(`{${keyValue}}`)});`);
      }
  }, _CypressStringifyExtension_appendNavigationStep = function _CypressStringifyExtension_appendNavigationStep(out, step) {
      out.appendLine(`cy.visit(${formatAsJSLiteral(step.url)});`);
  }, _CypressStringifyExtension_appendScrollStep = function _CypressStringifyExtension_appendScrollStep(out, step, flow) {
      if ('selectors' in step) {
          out.appendLine(`${handleSelectors(step.selectors, flow)}.scrollTo(${step.x}, ${step.y});`);
      }
      else {
          out.appendLine(`cy.scrollTo(${step.x}, ${step.y});`);
      }
  }, _CypressStringifyExtension_appendViewportStep = function _CypressStringifyExtension_appendViewportStep(out, step) {
      out.appendLine(`cy.viewport(${step.width}, ${step.height});`);
  };
  function formatAsJSLiteral(value) {
      return JSON.stringify(value);
  }
  function filterArrayByString(selectors, value) {
      return selectors.filter((selector) => value === 'aria/'
          ? !selector[0].includes(value)
          : selector[0].includes(value));
  }
  function handleSelectors(selectors, flow) {
      // Remove Aria selectors in favor of DOM selectors
      const nonAriaSelectors = filterArrayByString(selectors, 'aria/');
      let preferredSelector;
      // Give preference to user-specified selectors
      if (flow === null || flow === void 0 ? void 0 : flow.selectorAttribute) {
          preferredSelector = filterArrayByString(nonAriaSelectors, flow.selectorAttribute);
      }
      if (preferredSelector && preferredSelector[0]) {
          return `cy.get(${formatAsJSLiteral(preferredSelector[0][0])})`;
      }
      else {
          return `cy.get(${formatAsJSLiteral(nonAriaSelectors[0][0])})`;
      }
  }

  function parseRecordingContent(recordingContent) {
      return parse(JSON.parse(recordingContent));
  }
  async function stringifyParsedRecording(parsedRecording) {
      return await stringify(parsedRecording, {
          extension: new CypressStringifyExtension(),
      });
  }
  async function stringifyParsedStep(step) {
      return await stringifyStep(step, {
          extension: new CypressStringifyExtension(),
      });
  }
  async function cypressStringifyChromeRecording(recording) {
      // If no recordings found, log message and return.
      if (recording.length === 0) {
          console.log('No recordings found. Please create and upload one before trying again.');
          return;
      }
      const parsedRecording = parseRecordingContent(recording);
      const cypressStringified = await stringifyParsedRecording(parsedRecording);
      return cypressStringified;
  }

  class RecorderPlugin {
    async stringify(recording) {
      return await cypressStringifyChromeRecording(JSON.stringify(recording));
    }

    async stringifyStep(step) {
      return await stringifyParsedStep(step);
    }
  }

  /* eslint-disable no-undef */
  chrome.devtools.recorder.registerRecorderExtensionPlugin(
    new RecorderPlugin(),
    /* name=*/ 'Cypress Test',
    /* mediaType=*/ 'application/javascript'
  );

  exports.RecorderPlugin = RecorderPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
