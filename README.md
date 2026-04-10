# BT Qlik Sense Extensions

Custom Qlik Sense extensions — fully customizable, single-file, zero dependencies.

![Qlik](https://img.shields.io/badge/Qlik%20Sense-2024%2B-16a34a) ![Qlik Cloud](https://img.shields.io/badge/Qlik%20Cloud-compatible-2563eb) ![License](https://img.shields.io/badge/license-as--is-94a3b8)

## Extensions

| Extension | Description | Download |
|-----------|-------------|----------|
| [**BT Variable Toggle Extended**](bt-variable-toggle-extended/) | Advanced variable toggle with checkbox/switch/button styles, multi-value cycling, cascading, expressions, dark mode | [.zip](bt-variable-toggle-extended/bt-variable-toggle-extended.zip) |
| [**BT Variable Input**](bt-variable-input/) | Pro variable input with 6 control types: text, number, slider, dropdown, button group, date picker | [.zip](bt-variable-input/bt-variable-input.zip) |

## Install

**Qlik Cloud:** Management Console > Extensions > Add > upload the `.zip` file

**Qlik Sense Enterprise:** Copy the `.js` and `.qext` files to:
```
C:\Users\{user}\Documents\Qlik\Sense\Extensions\{extension-name}\
```

No build step. No npm. No external dependencies. Works offline and in air-gapped environments.

## Compatibility

- Qlik Sense Enterprise February 2024+
- Qlik Cloud
- Air-gapped / offline environments
- Single file per extension, zero external dependencies

## Author

**Godja Vasile** — [github.com/vasile-godja](https://github.com/vasile-godja)

## Disclaimer

These extensions are provided as-is. The author does not assume responsibility for maintenance, support, or future updates. Use at your own risk.
