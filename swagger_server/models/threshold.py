# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server.models.alert import Alert  # noqa: F401,E501
from swagger_server import util


class Threshold(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, range: str=None, alert: Alert=None, weight: float=None):  # noqa: E501
        """Threshold - a model defined in Swagger

        :param range: The range of this Threshold.  # noqa: E501
        :type range: str
        :param alert: The alert of this Threshold.  # noqa: E501
        :type alert: Alert
        :param weight: The weight of this Threshold.  # noqa: E501
        :type weight: float
        """
        self.swagger_types = {
            'range': str,
            'alert': Alert,
            'weight': float
        }

        self.attribute_map = {
            'range': 'range',
            'alert': 'alert',
            'weight': 'weight'
        }
        self._range = range
        self._alert = alert
        self._weight = weight

    @classmethod
    def from_dict(cls, dikt) -> 'Threshold':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The Threshold of this Threshold.  # noqa: E501
        :rtype: Threshold
        """
        return util.deserialize_model(dikt, cls)

    @property
    def range(self) -> str:
        """Gets the range of this Threshold.


        :return: The range of this Threshold.
        :rtype: str
        """
        return self._range

    @range.setter
    def range(self, range: str):
        """Sets the range of this Threshold.


        :param range: The range of this Threshold.
        :type range: str
        """

        self._range = range

    @property
    def alert(self) -> Alert:
        """Gets the alert of this Threshold.


        :return: The alert of this Threshold.
        :rtype: Alert
        """
        return self._alert

    @alert.setter
    def alert(self, alert: Alert):
        """Sets the alert of this Threshold.


        :param alert: The alert of this Threshold.
        :type alert: Alert
        """

        self._alert = alert

    @property
    def weight(self) -> float:
        """Gets the weight of this Threshold.


        :return: The weight of this Threshold.
        :rtype: float
        """
        return self._weight

    @weight.setter
    def weight(self, weight: float):
        """Sets the weight of this Threshold.


        :param weight: The weight of this Threshold.
        :type weight: float
        """

        self._weight = weight
