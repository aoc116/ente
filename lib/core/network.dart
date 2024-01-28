import 'dart:io';

import 'package:dio/dio.dart';
import 'package:ente_auth/core/configuration.dart';
import 'package:ente_auth/core/constants.dart';
import 'package:ente_auth/utils/package_info_util.dart';
import 'package:ente_auth/utils/platform_util.dart';
import 'package:fk_user_agent/fk_user_agent.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

int kConnectTimeout = 15000;

class Network {
  // apiEndpoint points to the Ente server's API endpoint
  static const apiEndpoint = String.fromEnvironment(
    "endpoint",
    defaultValue: kDefaultProductionEndpoint,
  );
  late Dio _dio;
  late Dio _enteDio;

  Future<void> init() async {
    if (PlatformUtil.isMobile()) await FkUserAgent.init();
    final packageInfo = await PackageInfoUtil().getPackageInfo();
    final version = PackageInfoUtil().getVersion(packageInfo);
    final packageName = PackageInfoUtil().getPackageName(packageInfo);

    final preferences = await SharedPreferences.getInstance();

    _dio = Dio(
      BaseOptions(
        connectTimeout: Duration(milliseconds: kConnectTimeout),
        headers: {
          HttpHeaders.userAgentHeader: PlatformUtil.isMobile()
              ? FkUserAgent.userAgent
              : Platform.operatingSystem,
          'X-Client-Version': version,
          'X-Client-Package': packageName,
        },
      ),
    );
    _dio.interceptors.add(RequestIdInterceptor());
    _enteDio = Dio(
      BaseOptions(
        baseUrl: apiEndpoint,
        connectTimeout: Duration(milliseconds: kConnectTimeout),
        headers: {
          if (PlatformUtil.isMobile())
            HttpHeaders.userAgentHeader: FkUserAgent.userAgent
          else
            HttpHeaders.userAgentHeader: Platform.operatingSystem,
          'X-Client-Version': version,
          'X-Client-Package': packageName,
        },
      ),
    );
    _enteDio.interceptors.add(EnteRequestInterceptor(preferences, apiEndpoint));
  }

  Network._privateConstructor();

  static Network instance = Network._privateConstructor();

  Dio getDio() => _dio;
  Dio get enteDio => _enteDio;
}

class RequestIdInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // ignore: prefer_const_constructors
    options.headers.putIfAbsent("x-request-id", () => Uuid().v4().toString());
    return super.onRequest(options, handler);
  }
}

class EnteRequestInterceptor extends Interceptor {
  final SharedPreferences _preferences;
  final String enteEndpoint;

  EnteRequestInterceptor(this._preferences, this.enteEndpoint);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      assert(
        options.baseUrl == enteEndpoint,
        "interceptor should only be used for API endpoint",
      );
    }
    // ignore: prefer_const_constructors
    options.headers.putIfAbsent("x-request-id", () => Uuid().v4().toString());
    final String? tokenValue = _preferences.getString(Configuration.tokenKey);
    if (tokenValue != null) {
      options.headers.putIfAbsent("X-Auth-Token", () => tokenValue);
    }
    return super.onRequest(options, handler);
  }
}
