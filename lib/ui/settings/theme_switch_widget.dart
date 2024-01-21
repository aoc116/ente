

import 'package:adaptive_theme/adaptive_theme.dart';
import 'package:ente_auth/ente_theme_data.dart';
import 'package:ente_auth/theme/ente_theme.dart';
import 'package:ente_auth/ui/components/captioned_text_widget.dart';
import 'package:ente_auth/ui/components/expandable_menu_item_widget.dart';
import 'package:ente_auth/ui/components/menu_item_widget.dart';
import 'package:ente_auth/ui/settings/common_settings.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ThemeSwitchWidget extends StatefulWidget {
  const ThemeSwitchWidget({super.key});

  @override
  State<ThemeSwitchWidget> createState() => _ThemeSwitchWidgetState();
}

class _ThemeSwitchWidgetState extends State<ThemeSwitchWidget> {
  AdaptiveThemeMode? currentThemeMode;

  @override
  void initState() {
    super.initState();
    AdaptiveTheme.getThemeMode().then(
      (value) {
        currentThemeMode = value ?? AdaptiveThemeMode.system;
        debugPrint('theme value $value');
        if (mounted) {
          setState(() => {});
        }
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ExpandableMenuItemWidget(
      title: "Theme",
      selectionOptionsWidget: _getSectionOptions(context),
      leadingIcon: Theme.of(context).brightness == Brightness.light
          ? Icons.light_mode_outlined
          : Icons.dark_mode_outlined,
    );
  }

  Widget _getSectionOptions(BuildContext context) {
    return Column(
      children: [
        sectionOptionSpacing,
        _menuItem(context, AdaptiveThemeMode.light),
        sectionOptionSpacing,
        _menuItem(context, AdaptiveThemeMode.dark),
        sectionOptionSpacing,
        _menuItem(context, AdaptiveThemeMode.system),
        sectionOptionSpacing,
      ],
    );
  }

  Widget _menuItem(BuildContext context, AdaptiveThemeMode themeMode) {
    return MenuItemWidget(
      captionedTextWidget: CaptionedTextWidget(
        title: toBeginningOfSentenceCase(themeMode.name)!,
        textStyle: Theme.of(context).colorScheme.enteTheme.textTheme.body,
      ),
      pressedColor: getEnteColorScheme(context).fillFaint,
      isExpandable: false,
      trailingIcon: currentThemeMode == themeMode ? Icons.check : null,
      trailingExtraMargin: 4,
      onTap: () async {
        AdaptiveTheme.of(context).setThemeMode(themeMode);
        currentThemeMode = themeMode;
        if (mounted) {
          setState(() {});
        }
      },
    );
  }
}
